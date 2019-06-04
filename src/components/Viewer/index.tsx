/**
 * @desc 编辑面板
 */

import * as React from 'react'
import { CellType, ViewerPropsType, MountedFunctionType } from '../../typings'
import useCells from '../../uses/useCells'
import { getViewerId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import deepCopy from '../../util/deepCopy'
import * as tj from '../../util/typeJudgement'
import useCommander from '../../commander'

const { useState, useLayoutEffect, useRef, useEffect, useCallback } = React

export default function (onMounted?:MountedFunctionType) {

  /**
   * 展示面板组件
   * @param width 面板宽度
   * @param height 面板高度
   * @param cells 面板内容
   * @param id 面板id
   * @param style 面板扩展样式
   * @param isSingleScreen  @TODO
   */
  return function viewer({ cells, height, width, style, isSingleScreen, id }:ViewerPropsType) {
    const [viewerId] = useState(getViewerId(id)) // id设置为常量
    const [parentSize, setParentSize] = useState<{width:number, height:number}>({ width:0, height:0 })
    const viewerRef = useRef<HTMLDivElement|null>(null)

    const [cellsState, dispatchCellsState] = useCellsReducer(cells)

    const connectWithCommander = useCommander(cellsState, dispatchCellsState)

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

    useEffect(() => {
      return () => {
        if (onMounted && tj.isFunction(onMounted)) onMounted(viewerId)
      }
    }, [])

    useEffect(() => {

    }, [cells, parentSize.width, parentSize.height])

    return connectWithCommander(
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
      </div>,
    )
  }
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
