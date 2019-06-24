/**
 * @desc 编辑面板
 */

import * as React from 'react'
import { CellType, EditorType } from '../../typings'
import useCells from '../../uses/useCells'
import useConstantState from '../../uses/useConstantState'
import useGuider from '../../guider'
import useShortcutKey from '../../uses/useShortcutKey'
import { getEditorId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import useTouchedRelativePosition from '../../uses/useTouchedRelativePosition'
import * as tj from '../../util/typeJudgement'
import useCommander from '../../commander'
import Timeout = NodeJS.Timeout

const { useState, useRef, useEffect, useCallback, useLayoutEffect } = React

type PositionType = [number, number]

/**
 * 拖拽编辑面板组件
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 面板内容
 * @param onChange 拖拽完成之后执行回调
 * @param id 面板id
 * @param style 面板扩展样式
 */
export default function editor({ width, height, cells, onChange, id, style }:EditorType) {

  const editorId = useConstantState(getEditorId(id)) // id设置为常量

  const panelRef = useRef<HTMLDivElement|null>(null)
  const startPosition = useRef<PositionType>()
  const resizeTag = useRef<string>('')
  const timeoutToHideGuideLines = useRef<Timeout>()

  const [guideLinesVisible, setGuideLinesVisible] = useState<boolean>(false)
  const [isActiveEditor, setIsActiveEditor] = useState<boolean>(false)
  const [editorPanel, setEditorPanel] = useState<HTMLDivElement|null>(null)

  const [cellsState, dispatchCellsState] = useCellsReducer(cells)

  const getTouchRelativePosition = useTouchedRelativePosition(editorPanel)

  useCommander(`editor-${editorId}`, cellsState, dispatchCellsState)

  const handleClickOutside = useCallback((event:any) => {
    const path = event.path
    if (!path || !path.length) {
      return setIsActiveEditor(false)
    }
    if (path.every((item:HTMLElement) => item.id !== editorId)) {
      setIsActiveEditor(false)
    }
  }, [editorId])

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
          data: startPosition.current,
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
    // setGuideLinesVisible(true)

    const [startX, startY] = startPosition.current
    const [moveX, moveY] = getTouchRelativePosition(event)
    let [diffX, diffY] = [moveX - startX, moveY - startY]

    if ((Math.abs(diffX) <= 2) && (Math.abs(diffY) <= 2)) return

    startPosition.current = [moveX, moveY]
    document.body.style.userSelect = 'none' // 禁止页面的选中

    if (resizeTag.current) {
      // 判断为resize操作
      const [direction, id] = resizeTag.current.split('*')
      dispatchCellsState([{
        type: 'select',
        payload: {
          keys: [id],
        },
      }, {
        type: 'resize',
        payload: {
          direction,
          data: [diffX, diffY],
        },
      }])
    } else {
      // 判断为move操作
      dispatchCellsState([{
        type: 'move',
        payload: {
          data: [diffX, diffY],
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

  // cell的渲染
  const cellDoms = useCells(cellsState)

  // 标线的渲染
  const guideLines = useGuider({
    ...cellsState,
    editorW: width,
    editorH: height,
    visible: guideLinesVisible,
    dispatcher: dispatchCellsState,
  })

  // side effect 快捷键
  useShortcutKey({
    isActive: isActiveEditor,
    dispatch: dispatchCellsState,
  })

  useLayoutEffect(() => {
    if (panelRef.current) {
      setEditorPanel(panelRef.current)
    }
  }, [panelRef.current])

  useEffect(() => {
    if (onChange && tj.isFunction(onChange)) onChange(cellsState.allCells)
    if (!guideLinesVisible) setGuideLinesVisible(true)
    if (timeoutToHideGuideLines.current) {
      clearTimeout(timeoutToHideGuideLines.current)
    }
    timeoutToHideGuideLines.current = setTimeout(() => {
      setGuideLinesVisible(false)
    }, 400)
  }, [cellsState])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      id={editorId}
      key={editorId}
      ref={panelRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className="editor"
      style={{
        ...style,
        width,
        height,
        position: 'relative',
      }}
    >
      { cellDoms }
      { guideLines }
    </div>
  )
}
