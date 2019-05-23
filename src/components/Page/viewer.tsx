import * as React from 'react'
import { CellType, ViewerPropsType } from '../../typings'
import useCells from './uses/useCells'
import guid from '../../util/guid'
import useCellsReducer from './uses/useCellsReducer'
import deepCopy from '../../util/deepCopy'

const { useState, useLayoutEffect, useRef } = React

export default function viewer({
  cells,
  height,
  width,
  style,
  isSingleScreen,
  id,
}:ViewerPropsType) {

  const [viewerId] = useState(`viewer-${id || guid()}`) // id设置为常量
  const [parentSize, setParentSize] = useState<{width:number, height:number}>({ width:0, height:0 })
  const viewerRef = useRef<HTMLDivElement|null>(null)

  const [cellsState, dispatchCellsState] = useCellsReducer(
    deepCopy(cells.map((cell:CellType) => {
      cell.id = cell.id || `cell-${guid()}`
      return cell
    })),
  ) // 非受控了...

  // cell的渲染
  const cellDoms = useCells(cellsState, true)

  useLayoutEffect(() => {
    let purePageContainerDom = viewerRef.current.parentElement
    if (!purePageContainerDom) {
      setParentSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    } else {
      setParentSize({
        width: purePageContainerDom.offsetWidth,
        height: purePageContainerDom.offsetHeight,
      })
    }
    purePageContainerDom = null
  }, [viewerRef.current])

  return (
    <div
      id={viewerId}
      key={viewerId}
      ref={viewerRef}
      className="viewer"
      style={{
        ...style,
        width,
        height,
        overflowX: 'hidden',
        overflowY: isSingleScreen ? 'hidden' : 'auto',
        transform: `scale(${parentSize.width / (width || 1)})`,
        position: 'relative',
        transformOrigin: 'left top',
      }}
    >
      { cellDoms }
    </div>
  )
}

// if (isSingleScreen) {
//   const { width: parentW, height: parentH } = parentSize
//   const heightToResize = ((parentH / parentW) * Number(width)) - Number(height)
//   const flexBlocks:CellPropsType[] = []
//   let allFlexBlockWeight = 0
//
//   // 寻找 FlexBlock
//   newCells.forEach((cell:CellPropsType) => {
//     if (cell.type === 'FlexBlock') {
//       flexBlocks.push(cell)
//       allFlexBlockWeight += Number(cell.h)
//     }
//   })
//
//   // 计算每个cell 的变化
//   newCells.forEach((cell:CellPropsType) => {
//     const currentY = cell.y
//     let valueToReset = 0
//     flexBlocks.forEach((flexBlockCell: any) => {
//       if (flexBlockCell.y < currentY && (cell.type !== 'FlexBlock')) {
//         const { h } = flexBlockCell
//         let tempHeightToResize = (h / allFlexBlockWeight) * heightToResize
//         if ((h + tempHeightToResize) < 0) {
//           tempHeightToResize = -h
//         }
//         valueToReset += tempHeightToResize
//       }
//     })
//     cell.y += valueToReset
//   })
//
//   // 计算每个FlexBlock的拉伸长度
//   flexBlocks.forEach((cell:CellPropsType) => {
//     cell.h += ((cell.h / allFlexBlockWeight) * heightToResize)
//     if (cell.h < 0) cell.h = 0
//   })
// }
