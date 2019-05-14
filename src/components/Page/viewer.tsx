import * as React from 'react'
import { CellPropsType, ExportedPagePropsType } from '../../typings'
import useCells from './uses/useCells'
import deepCopy from '../../util/deepCopy'

const { useState, useLayoutEffect, useMemo } = React

// 根据id获取父容器的尺寸
const useParentSize = (pageId:string) => {
  const [parentSize, getNewParentSize] = useState()

  useLayoutEffect(() => {
    let purePageContainerDom = document.getElementById(pageId)
    if (!purePageContainerDom) {
      getNewParentSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    } else {
      getNewParentSize({
        parentW: purePageContainerDom.offsetWidth,
        parentH: purePageContainerDom.offsetHeight,
      })
    }
    purePageContainerDom = null
  }, [pageId])

  return parentSize
}

export default function viewer({
  cells,
  height,
  width,
  isSingleScreen,
  id,
}:ExportedPagePropsType) {

  const parentSize = useParentSize(id)

  const cellsInViewer = useMemo(() => {
    const newCells:CellPropsType[] = deepCopy(cells)
    if (isSingleScreen) {
      const { width: parentW, height: parentH } = parentSize
      const heightToResize = ((parentH / parentW) * Number(width)) - Number(height)
      const flexBlocks:CellPropsType[] = []
      let allFlexBlockWeight = 0

      // 寻找 FlexBlock
      newCells.forEach(cell => {
        if (cell.type === 'FlexBlock') {
          flexBlocks.push(cell)
          allFlexBlockWeight += Number(cell.h)
        }
      })

      // 计算每个cell 的变化
      newCells.forEach(cell => {
        const currentY = cell.y
        let valueToReset = 0
        flexBlocks.forEach((flexBlockCell: any) => {
          if (flexBlockCell.y < currentY && (cell.type !== 'FlexBlock')) {
            const { h } = flexBlockCell
            let tempHeightToResize = (h / allFlexBlockWeight) * heightToResize
            if ((h + tempHeightToResize) < 0) {
              tempHeightToResize = -h
            }
            valueToReset += tempHeightToResize
          }
        })
        cell.y += valueToReset
      })

      // 计算每个FlexBlock的拉伸长度
      flexBlocks.forEach(cell => {
        cell.h += ((cell.h / allFlexBlockWeight) * heightToResize)
        if (cell.h < 0) cell.h = 0
      })
    }
    return newCells
  }, [cells, isSingleScreen])

  const cellDoms = useCells(cellsInViewer)

  return (
    <div
      id={id}
      className="page"
    >
      {
        (!!width && !!height) && (
          <div
            className="page-exported"
            style={{
              width,
              height,
              overflowX: 'hidden',
              overflowY: isSingleScreen ? 'hidden' : 'auto',
              transform: `scale(${parentSize.parentW / width})`,
            }}
          >
            { cellDoms }
          </div>
        )
      }
    </div>
  )
}
