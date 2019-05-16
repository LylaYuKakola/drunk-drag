import * as React from 'react'
import './index.scss'
import {
  CellPropsType,
  PagePropsType,
  ActionOfReducerType,
} from '../../typings'
import useCells from './uses/useCells'
import useGuildLine from './uses/useGuildLine'
import { guid } from '../../util/guid'
import useCellsReducer from './uses/useCellsReducer'

const { useState, useEffect, useRef, useCallback } = React

export default function page({ width, height, cells, onChange, id, style }:PagePropsType) {

  // id常量
  const [pageId] = useState(id || `page-${guid()}`)

  const pagePanel:{current: any} = useRef() // 拖拽面板的dom引用
  const isActiveEditor:{current: boolean} = useRef(false) // 拖拽面板是否是active状态
  const isDragging:{current: boolean} = useRef(false) // 是否在执行拖拽
  const startX:{current: number} = useRef(0) // 拖拽开始的X轴位置
  const startY:{current: number} = useRef(0) // 拖拽开始的Y轴位置
  const cellIdToResize:{current: string} = useRef() // 要执行resize的cell
  const directionToResize:{current: string} = useRef('') // 要执行resize的方向isDragging
  const cellIdUnderTouchStart:{current: string} = useRef() // 要进行移动的cell
  const panelRect:{current: any} = useRef({ left: 0, top: 0 })

  const [guideLinesVisible, setGuideLinesVisible] = useState(false) // 标线是否展示
  const [cellsState, dispatchCellsState] = useCellsReducer(cells.map((cell:CellPropsType) => {
    cell.id = cell.id || `cell-${guid()}`
    return cell
  }), width, height)

  useEffect(() => {
    if (pagePanel.current) {
      panelRect.current = pagePanel.current.getBoundingClientRect()
    }
  }, [pagePanel.current])

  const getTouchRelativePosition = useCallback((event:any):[number, number] => {
    if (event.type.startsWith('mouse') || (event.type === 'contextmenu')) {
      return [event.clientX - panelRect.current.left, event.clientY - panelRect.current.top]
    }
    return [
      event.touches[0].clientX - panelRect.current.left,
      event.touches[0].clientY - panelRect.current.top,
    ]
  }, [panelRect.current])

  const handleDragStart = useCallback((event:any) => {
    // event.stopPropagation()
    // event.nativeEvent.stopImmediatePropagation()

      // 获取开始点击的位置
    [startX.current, startY.current] = getTouchRelativePosition(event)
    if (startX.current < 0 || startY.current < 0) return

    isActiveEditor.current = true

    if (event!.target!.dataset!.tag) {
      // 点击位置发生在页面元素的边框处，判断为resize操作
      const [, direction, id] = event.target.dataset.tag.split('*')
      cellIdToResize.current = id
      directionToResize.current = direction
    } else {
      // 点击位置发生在页面上（编辑面板或者元素上）
      cellsState.allCells.forEach((cell:CellPropsType) => {
        const { x, y, h, w } = cell
        if ((startX.current >= x) &&
          (startX.current <= (x + w)) &&
          (startY.current >= y) &&
          (startY.current <= (y + h))
        ) {
          cellIdUnderTouchStart.current = cell.id
        }
      })

      const actions:ActionOfReducerType[] = [{
        type: 'clearSelected',
      }]
      if (cellIdUnderTouchStart.current) {
        actions.push({
          type: 'addSelected',
          payload: {
            key: cellIdUnderTouchStart.current,
          },
        })
      }
      dispatchCellsState(actions)
    }

    if (event.type.startsWith('mouse')) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleDragEnd)
    } else {
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('touchend', handleDragEnd)
    }
  }, [])

  const handleMove = useCallback(() => {
    setGuideLinesVisible(true)

    const [moveX, moveY] = getTouchRelativePosition(event)
    const [diffX, diffY] = [moveX - startX.current, moveY - startY.current]

    // 优化，增加距离校验，移动距离大于1px才算移动
    if ((Math.abs(diffX) <= 2) && (Math.abs(diffY) <= 2)) return

    [startX.current, startY.current] = [moveX, moveY]
    isDragging.current = true
    document.body.style.userSelect = 'none' // 禁止页面的选中

    if (cellIdToResize.current) {
      // 判断为resize操作
      dispatchCellsState([{
        type: 'resize',
        payload: {
          key: cellIdToResize.current,
          data: [diffX, diffY],
          direction: directionToResize.current,
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

  // handleDragEnd
  const handleDragEnd = useCallback(() => {
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
    isActiveEditor.current = false
    startX.current = 0
    startY.current = 0
    isDragging.current = false
    cellIdToResize.current = null
    cellIdUnderTouchStart.current = ''
    directionToResize.current = ''
    setTimeout(() => {
      setGuideLinesVisible(false)
    }, 200)
  }, [])

  // cell的渲染
  const cellDoms = useCells(cellsState)

  // 标线的渲染
  const guideLines = useGuildLine({
    ...cellsState,
    pageW: width,
    pageH: height,
    visible: guideLinesVisible,
  })

  return (
    <div
      id={pageId}
      key={pageId}
      ref={pagePanel}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className="page-container"
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
