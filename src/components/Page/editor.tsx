import * as React from 'react'
import './index.scss'
import { CellPropsType, PagePropsType } from '../../typings'
import useCells from './uses/useCells'
import useGuildLine from './uses/useGuildLine'
import {
  MIN_HEIGHT_OF_CELL,
  MIN_WIDTH_OF_CELL,
} from '../../util/constVariables'
import { guid } from '../../util/guid'

const { useState, useEffect, useRef, useMemo, useCallback } = React

export default function page({ width, height, cells, onChange }:PagePropsType) {

  // id常量
  const [pageId] = useState(`page-${guid()}`)

  // 成员变量
  const pagePanel:{current: any} = useRef() // 拖拽面板的dom引用
  const isChangedInside:{current: boolean} = useRef(false) // 是否是内部修改
  const isPageActive:{current: boolean} = useRef(false) // 拖拽面板是否是active状态
  const isDragging:{current: boolean} = useRef(false) // 是否在执行拖拽
  const startX:{current: number} = useRef(0) // 拖拽开始的X轴位置
  const startY:{current: number} = useRef(0) // 拖拽开始的Y轴位置
  const cellToResize:{current: CellPropsType} = useRef() // 要执行resize的cell
  const directionToResize:{current: string} = useRef('') // 要执行resize的方向isDragging
  const typeToResize:{current: string} = useRef('') // 要执行resize的类型（边框拖拽/边角拖拽）
  const cellToMove:{current: CellPropsType} = useRef() // 要进行移动的cell
  const selectedCells:{current: CellPropsType[]} = useRef() // 选中的cells
  const activeX:{current: number} = useRef(0) // 进行拖拽部分的x
  const activeY:{current: number} = useRef(0) // 进行拖拽部分的y
  const activeW:{current: number} = useRef(0) // 进行拖拽部分的w
  const activeH:{current: number} = useRef(0) // 进行拖拽部分的h

  // 内部state
  const [cellsInState, setCellsInState] = useState(cells) // cells
  const [guideLinesVisible, setGuideLinesVisible] = useState(false) // 标线是否展示

    // 获取组件面板的绝对位置
  const panelRect = useMemo(() => {
    if (pagePanel.current) {
      return pagePanel.current.getBoundingClientRect()
    }
    return {
      left: 0,
      top: 0,
    }
  }, [pagePanel.current])

  const updateCellsFromInside = () => {
    isChangedInside.current = true
    setCellsInState([...cellsInState])
    onChange && onChange(cellsInState)
  }

  // 获取当前鼠标相对于面板的位置
  const getRelativePositionFromEvent = useCallback((event:any):[number, number] => {
    if (event.type.startsWith('mouse') || (event.type === 'contextmenu')) {
      return [event.clientX - panelRect.left, event.clientY - panelRect.top]
    }
    return [
      event.touches[0].clientX - panelRect.left,
      event.touches[0].clientY - panelRect.top,
    ]
  }, [panelRect])

  // handleDragStart
  const handleDragStart = useCallback((event:any) => {
    event.nativeEvent.stopImmediatePropagation()

    isPageActive.current = true // 激活快捷键

    // 获取当前的鼠标相对编辑面板的点击位置
    const relativePosition = getRelativePositionFromEvent(event)
    startX.current = relativePosition[0]
    startY.current = relativePosition[1]

    // 根据 event.target 判断是否点击的是否是cell的边框
    // cell的边框的四个角和四条边都加了一个tag的属性，通过判断这个属性去区分
    if (event.target.dataset.tag) {
      startDraggingOnCellBorder(event.target.dataset.tag)
    } else {
      startDraggingOnPageOrCell()
    }

    if (event.type.startsWith('mouse')) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleDragEnd)
    } else {
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('touchend', handleDragEnd)
    }
  }, [])

  // handleMove
  const handleMove = useCallback(() => {
    setGuideLinesVisible(true)

    // 记录移动距离
    const [moveX, moveY] = getRelativePositionFromEvent(event)
    const [diffX, diffY] = [moveX - startX.current, moveY - startY.current]

    // 优化，增加距离校验，移动距离大于1px才算移动
    if ((Math.abs(diffX) <= 2) && (Math.abs(diffY) <= 2)) return

    startX.current = moveX
    startY.current = moveY
    isDragging.current = true
    document.body.style.userSelect = 'none' // 禁止页面的选中

    // 判断操作的是cells还是cellBorder
    if (cellToResize.current) {
      dragOnCellBorder(diffX, diffY)
    } else {
      dragOnOnPageOrCells(diffX, diffY)
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
    isDragging.current = false
    cellToResize.current = null
    directionToResize.current = ''
    typeToResize.current = ''
    cellToMove.current = null
    setTimeout(() => {
      setGuideLinesVisible(false)
      activeW.current = 0
      activeH.current = 0
    }, 200)
  }, [])

  // startDraggingOnCellBorder
  const startDraggingOnCellBorder = useCallback((tag:string) => {
    const [type, direction, cellIndex] = tag.split('*')
    cellToResize.current = cellsInState[Number(cellIndex)]
    directionToResize.current = direction
    typeToResize.current = type
  }, [cellsInState])

  // startDraggingOnPageOrCell
  const startDraggingOnPageOrCell = useCallback(() => {
    if (startX.current < 0 || startY.current < 0) return // 判断点击发生在page外，处理为非法点击
    // 判断是否点击在cell上（多选情况需要考虑）
    if (cellsInState && cellsInState.length) {
      cellsInState.forEach((cell:CellPropsType) => {
        const { x, y, h, w } = cell

        // @TODO 旋转功能暂时去掉
        // if (cell.rotate) {
        //   const [centerX, centerY] = [x + (w / 2), y + (h / 2)]
        //   let [newStartX, newStartY] = [startX - centerX, startY - centerY]
        //   const pointToStartLength = Math.sqrt((newStartX * newStartX) + (newStartY * newStartY))
        //   const originR = Math.atan2(newStartY, newStartX)
        //   const newR = (originR - ((cell.rotate / 180) * Math.PI))
        //   newStartX = Math.cos(newR) * pointToStartLength
        //   newStartY = Math.sin(newR) * pointToStartLength
        //   if ((Math.abs(newStartX) <= w / 2) && (Math.abs(newStartY) <= h / 2)) {
        //     currentCellToClick = cell
        //   }
        // }

        if ((startX.current >= x) &&
          (startX.current <= (x + w)) &&
          (startY.current >= y) &&
          (startY.current <= (y + h))
        ) {
          cellToMove.current = cell
        }
      })
    }

    // 当前承接点击的cell设置为选中状态，并清除其他选中状态
    if (cellToMove.current) {
      selectedCells.current = [cellToMove.current]
    } else {
      selectedCells.current = []
    }

    updateCellsFromInside()
  }, [])

  // dragOnCellBorder
  const dragOnCellBorder = useCallback((diffX:number, diffY:number) => {
    const { x, y, h, w } = cellToResize.current

    // @TODO rotate暂时去掉
    // const [centerX, centerY] = [x + (w / 2), y + (h / 2)]
    // if (rotate) {
    //   const originR = Math.atan2(diffY, diffX)
    //   const pointToStartLength = Math.sqrt((diffY * diffY) + (diffX * diffX))
    //   const newR = (originR - ((rotate / 180) * Math.PI))
    //   diffX = Math.floor(Math.cos(newR) * pointToStartLength)
    //   diffY = Math.floor(Math.sin(newR) * pointToStartLength)
    // }
    // 首先判断是否为旋转
    // if (directionToResize.current.includes('deg')) {
    //   // 根据当前操作的cell的中心点去计算
    //   const r = -Math.atan2(centerX - moveX, centerY - moveY)
    //   const rnum = ((r / Math.PI) * 180)
    //   currentCellToResize.rotate = currentCellToResize.rotate || 0
    //   currentCellToResize.rotate = Math.floor(rnum / 15) * 15
    //   return
    // }

    // @TODO 暂时复制功能去掉
    // if (directionToResize.current.includes('add')) {}

    // left
    if (directionToResize.current.includes('l')) {
      cellToResize.current.x += diffX
      cellToResize.current.w -= diffX
    }
    // right
    if (directionToResize.current.includes('r')) {
      cellToResize.current.w += diffX
    }
    // top
    if (directionToResize.current.includes('t')) {
      cellToResize.current.y += diffY
      cellToResize.current.h -= diffY
    }
    // bottom
    if (directionToResize.current.includes('b')) {
      cellToResize.current.h += diffY
    }

    // 边界矫正
    if (cellToResize.current.x < 0) {
      cellToResize.current.w += (cellToResize.current.x)
      cellToResize.current.x = 0
    }
    if (cellToResize.current.y < 0) {
      cellToResize.current.h += (cellToResize.current.y)
      cellToResize.current.y = 0
    }
    if ((cellToResize.current.x + cellToResize.current.w) > width) {
      cellToResize.current.w = width - cellToResize.current.x
    }
    if ((cellToResize.current.y + cellToResize.current.h) > height) {
      cellToResize.current.h = height - cellToResize.current.y
    }

    // 最小宽高矫正
    if (cellToResize.current.w < MIN_WIDTH_OF_CELL) {
      if (directionToResize.current.includes('l')) {
        cellToResize.current.x -= (MIN_WIDTH_OF_CELL - cellToResize.current.w)
      }
      cellToResize.current.w = MIN_WIDTH_OF_CELL
    }
    if (cellToResize.current.h < MIN_HEIGHT_OF_CELL) {
      if (directionToResize.current.includes('t')) {
        cellToResize.current.y -= (MIN_HEIGHT_OF_CELL - cellToResize.current.h)
      }
      cellToResize.current.h = MIN_HEIGHT_OF_CELL
    }

    activeX.current = cellToResize.current.x
    activeY.current = cellToResize.current.y
    activeW.current = cellToResize.current.w
    activeH.current = cellToResize.current.h

    setCellsInState([...cellsInState])
  }, [width, height])

  // dragOnOnPageOrCells
  const dragOnOnPageOrCells = useCallback((diffX:number, diffY:number) => {

    // 分别记录一个selected组（单选或多选相同）
    // 的
    // 最左边的X坐标、最顶部的Y坐标、最右边的X坐标、最下边的坐标
    let [minX, minY, maxX, maxY] = [1000000, 1000000, 0, 0]
    selectedCells.current.forEach(cell => {
      const { x, y, w, h } = cell
      minX = minX < x ? minX : x
      minY = minY < y ? minY : y
      maxX = maxX > (x + w) ? maxX : (x + w)
      maxY = maxY > (y + h) ? maxY : (y + h)
    })

    activeX.current = minX
    activeY.current = minY
    activeW.current = maxX - minX
    activeH.current = maxY - minY

    // 根据 minX, minY, maxX, maxY 四个值去确定 diffX 和 diffY 的边界
    // 边框拖拽中做边界限制
    if ((minX + diffX) < 0) {
      diffX = 0 - minX
    } else if ((maxX + diffX) > width) {
      diffX = width - maxX
    }
    if ((minY + diffY) < 0) {
      diffY = 0 - minY
    } else if ((maxY + diffY) > height) {
      diffY = height - maxY
    }

    // 逐个cell加位移，更新页面
    selectedCells.current.forEach(cell => {
      cell.x += diffX
      cell.y += diffY
    })

    updateCellsFromInside()
  }, [width, height])

  // cell的渲染
  const cellDoms = useCells(cellsInState, selectedCells.current)

  // 标线的渲染
  const guideLines = useGuildLine({
    activeX: activeX.current,
    activeY: activeY.current,
    activeW: activeW.current,
    activeH: activeH.current,
    cells: cellsInState,
    selectedCells: selectedCells.current,
    pageW: width,
    pageH: height,
    visible: guideLinesVisible,
  })

  // 从外部同步cells
  useEffect(() => {
    if (isChangedInside.current) {
      isChangedInside.current = false
      return
    }
    setCellsInState(cells)
  }, [cells])

  return (
    <div
      id={pageId}
      key={pageId}
      className="page"
    >
      <div className="page-container">
        <div
          ref={pagePanel}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
            width,
            height,
            position: 'relative',
          }}
        >
          { cellDoms }
          { guideLines }
        </div>
      </div>
    </div>
  )
}
