/**
 * @desc 展示面板
 */

import * as React from 'react'
import { CellType, ViewerPropsType } from '../../typings'
import useCells from '../../uses/useCells'
import useConstantState from '../../uses/useConstantState'
import { getViewerId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import useCommander from '../../commander'

const { useState, useLayoutEffect, useRef, useEffect, useMemo } = React

const MIN_FLEX_HEIGHT = 2

const doRound:(
  cells: CellType[],
  parentWidth:number,
  parentHeight:number,
  width:number,
  height:number,
) => CellType[] = (cells, parentWidth, parentHeight, width, height) => {
  if (!cells.length) return []
  const roundHeight = height - (width / parentWidth) * parentHeight
  const flexBlocks:[number, number][] = [[0, height]]
  cells
    .sort((curr:CellType, next:CellType) => curr.y < next.y ? -1 : 1)
    .forEach((cell: CellType) => {
      const { y: cy, h: ch } = cell
      const [fy, fh] = flexBlocks[flexBlocks.length - 1]
      const lastIndex = flexBlocks.length - 1
      if ((cy + ch) <= fy) return
      if (cy >= (fy + fh)) return
      if (cy <= fy && (cy + ch) > fy && (cy + ch) < (fy + fh)) {
        flexBlocks[lastIndex] = [cy + ch, (fy + fh) - (cy + ch)]
        return
      }
      if (cy <= fy && (cy + ch) > fy && (cy + ch) >= (fy + fh)) {
        flexBlocks.pop()
        return
      }
      if (cy > fy && (cy + ch) < (fy + fh)) {
        flexBlocks[lastIndex] = [fy, cy - fy]
        flexBlocks.push([cy + ch, (fy + fh) - (cy + ch)])
        return
      }
      if (cy > fy && (cy + ch) >= (fy + fh)) {
        flexBlocks[lastIndex] = [fy, cy - fy]
        return
      }
    })

  const allFlexBlocksHeight:number = flexBlocks.reduce((prev, curr) => [0, prev[1] + curr[1]])[1]
  flexBlocks.forEach(([fy, fh]) => {
    let flexHeight = Math.round((fh / allFlexBlocksHeight) * roundHeight)
    if ((fh - flexHeight) < MIN_FLEX_HEIGHT) {
      flexHeight = fh - MIN_FLEX_HEIGHT
    }
    cells.forEach((cell:CellType) => {
      const { y } = cell
      if ((fy + (fh - flexHeight)) < y) {
        cell.y = y - flexHeight
      }
    })
  })
  return [...cells]
}

/**
 * 展示面板组件
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 面板内容
 * @param id 面板id
 * @param style 面板扩展样式
 * @param noScroll
 */
export default function viewer({ cells, height, width, style, id, noScroll = false }:ViewerPropsType) {
  const viewerId = useConstantState(getViewerId(id)) // id设置为常量
  const [parentSize, setParentSize] = useState<{width:number, height:number}>({ width:0, height:0 })
  const viewerRef = useRef<HTMLDivElement|null>(null)
  const [cellsState, dispatchCellsState] = useCellsReducer(cells)
  const cellDoms = useCells(cellsState, true)
  const isRounded = useRef(false)
  const viewerStyle = useMemo(() => {
    const h = !noScroll ? height :
      parentSize.width ? (width / parentSize.width) * parentSize.height :
        0
    return {
      ...style,
      width,
      height: h,
      overflowX: 'hidden',
      overflowY: noScroll ? 'hidden' : 'auto',
      transform: `scale(${parentSize.width / (width || 1)})`,
      position: 'relative',
      transformOrigin: 'left top',
    }
  }, [
    style, width, height,
    parentSize.width, parentSize.height,
    noScroll,
  ])

  useCommander(`viewer-${viewerId}`, cellsState, dispatchCellsState)

  useEffect(() => {
    if (!noScroll || isRounded.current) return
    if (
      cellsState.allCells.length &&
      parentSize.width &&
      parentSize.height &&
      width &&
      height
    ) {
      const newCell = doRound(cellsState.allCells, parentSize.width, parentSize.height, width, height)
      isRounded.current = true
      dispatchCellsState([{
        type: 'update',
        payload: { cells: newCell },
      }])
    }
  }, [parentSize.width, parentSize.height, width, height, cellsState.allCells, noScroll])

  useLayoutEffect(() => {
    let purePageContainerDom = viewerRef.current.parentElement
    let [pw, ph] = [0, 0]
    if (!purePageContainerDom) {
      [pw, ph] = [window.innerWidth,  window.innerHeight]
    } else {
      [pw, ph] = [purePageContainerDom.offsetWidth,   purePageContainerDom.offsetHeight]
    }
    setParentSize({
      width: pw,
      height: ph,
    })
    purePageContainerDom = null
  }, [viewerRef.current, cellsState])

  return (
    <div
      id={viewerId}
      key={viewerId}
      ref={viewerRef}
      className="viewer"
      style={viewerStyle}
    >
      { cellDoms }
    </div>
  )
}
