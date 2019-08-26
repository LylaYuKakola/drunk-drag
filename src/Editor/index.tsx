/**
 * @desc 编辑面板
 */

import * as React from 'react'
import { EditorProps } from '../typings'
import useAllElements from '../uses/useAllElements'
import useAllViewports from '../uses/useAllViewports'
import useConstantState from '../uses/useConstantState'
import useGuider from '../guider'
import useShortcutKey from '../uses/useShortcutKey'
import { getEditorId } from '../util/guid'
import useCellsReducer from '../dispatcher'
import * as tj from '../util/typeJudgement'
import { ELEMENT, VIEWPORT } from '../util/constants'
import useCommander from '../commander'
import Timeout = NodeJS.Timeout

const { useState, useRef, useEffect, useCallback, useMemo } = React

type PositionType = number[]

/**
 * 拖拽编辑面板组件
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 元素们
 * @param viewports 视窗们
 * @param onChange 拖拽完成之后执行回调
 * @param id 面板id
 * @param style 面板扩展样式
 */
export default function editor({
  elements,
  viewports,
  height,
  width,
  style,
  onChange,
  id,
}:EditorProps) {

  const editorId = useConstantState(getEditorId(id)) // id设置为常量

  const panelRef = useRef<HTMLDivElement|null>(null)
  const startPosition = useRef<PositionType>()
  const resizeTag = useRef<string>('')
  const timeoutToHideGuideLines = useRef<Timeout>()
  const cellTag = useRef<string>(ELEMENT)

  // 标线相关
  const [guideLinesVisible, setGuideLinesVisible] = useState<boolean>(false)
  const [isActiveEditor, setIsActiveEditor] = useState<boolean>(false)

  // 展示的cell相关
  const [cellsState, dispatchCellsState] = useCellsReducer({ elements, viewports })
  const elementsDom = useAllElements(cellsState)
  const viewportsDom = useAllViewports(cellsState)

  // 获取点击位置相对于panel的相对坐标
  const getTouchRelativePosition = useCallback((event) => {
    if (
      !panelRef.current ||
      !panelRef.current.getBoundingClientRect ||
      !event
    ) return [-1000, -1000]
    const { left, top } = panelRef.current.getBoundingClientRect()
    if (event.type.startsWith('mouse') || (event.type === 'contextmenu')) {
      return [event.clientX - left, event.clientY - top]
    }
    return [
      event.touches[0].clientX - left,
      event.touches[0].clientY - top,
    ]
  }, [panelRef])

  // commander 的绑定
  useCommander(`editor-${editorId}`, cellsState, dispatchCellsState)

  // keyDown （这里的keyDown只执行shift控制的切换到viewport的编辑状态）
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Shift') cellTag.current = VIEWPORT
  }, [])

  // keyUp （这里的keyUp只执行shift控制的编辑viewport的状态恢复）
  const handleKeyUp = useCallback((event) => {
    if (event.key === 'Shift') cellTag.current = ELEMENT
  }, [])

  // 清除drag状态
  const handleClickOutside = useCallback((event:any) => {
    const path = event.path
    if (!path || !path.length) {
      return setIsActiveEditor(false)
    }
    if (path.every((item:HTMLElement) => item.id !== editorId)) {
      setIsActiveEditor(false)
    }
  }, [editorId])

  // drag start
  const handleDragStart = useCallback((event:any) => {
    // event.nativeEvent.stopImmediatePropagation()
    startPosition.current = getTouchRelativePosition(event)
    setIsActiveEditor(true)

    if (event!.target!.dataset!.tag) {
      resizeTag.current = event.target.dataset.tag
    } else {
      dispatchCellsState([{
        type: 'click',
        payload: {
          tag: cellTag.current,
          data: { click: startPosition.current },
        },
      }])
    }

    if (event.type.startsWith('mouse')) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleDragEnd)
    } else {
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('touchend', handleDragEnd)
    }
  }, [])

  // drag move
  const handleMove = useCallback((event:MouseEvent|TouchEvent) => {
    setGuideLinesVisible(true)

    const [startX, startY] = startPosition.current
    const [moveX, moveY] = getTouchRelativePosition(event)
    const [diffX, diffY] = [moveX - startX, moveY - startY]

    // if ((Math.abs(diffX) <= 2) && (Math.abs(diffY) <= 2)) return
    // @TODO 此处的优化另算

    startPosition.current = [moveX, moveY]
    document.body.style.userSelect = 'none' // 禁止页面的选中

    if (resizeTag.current) {
      // 判断为resize操作
      const [direction, id] = resizeTag.current.split('*')
      dispatchCellsState([{
        type: 'select',
        payload: {
          tag: cellTag.current,
          ids: [id],
        },
      }, {
        type: 'resize',
        payload: {
          tag: cellTag.current,
          data: {
            direction,
            resize: [diffX, diffY],
          },
        },
      }])
    } else {
      // 判断为move操作
      dispatchCellsState([{
        type: 'move',
        payload: {
          tag: cellTag.current,
          data: {
            move: [diffX, diffY],
          },
        },
      }])
    }
  }, [])

  // drag end
  const handleDragEnd = useCallback((event:MouseEvent|TouchEvent) => {
    // 首先移除document上的事件
    if (event.type.startsWith('mouse')) {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleDragEnd)
    } else {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleDragEnd)
    }

    // 重置状态变量
    document.body.style.userSelect = ''
    startPosition.current = null
    resizeTag.current = ''
  }, [])

  // 标线的渲染
  const guideLines = useGuider({
    cellsState,
    visible: guideLinesVisible,
    dispatcher: dispatchCellsState,
  })

  // 面板样式
  const panelStyle = useMemo(() => ({
    ...style,
    width,
    height,
    position: 'relative',
  }), [style, width, height])

  // side effect 快捷键
  useShortcutKey({
    isActive: isActiveEditor,
    dispatch: dispatchCellsState,
  })

  useEffect(() => {
    if (onChange && tj.isFunction(onChange)) onChange(cellsState)
    if (timeoutToHideGuideLines.current) {
      clearTimeout(timeoutToHideGuideLines.current)
    }
    timeoutToHideGuideLines.current = setTimeout(() => {
      setGuideLinesVisible(false)
    }, 200)
  }, [cellsState])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleClickOutside])

  return (
    <div
      id={editorId}
      key={editorId}
      ref={panelRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className="editor"
      style={panelStyle}
    >
      { elementsDom }
      { viewportsDom }
      { guideLines }
    </div>
  )
}
