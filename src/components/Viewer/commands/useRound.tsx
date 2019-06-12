import * as React from 'react'
import { CellsStateType, CellType, ReducerActionType } from '../../../typings'

const { useState, useMemo, useCallback } = React
const MIN_FLEX_HEIGHT = 2

interface ExtraCommanderForViewerType {
  parentSize: {width:number, height:number},
  width: number,
  height: number,
  cellsState: CellsStateType,
  dispatchCellsState: (actions:ReducerActionType[]) => void
}

export default function useExtraCommanderForViewer({
  parentSize, width, height, cellsState, dispatchCellsState,
}: ExtraCommanderForViewerType) {
  const [isRounded, setIsRounded] = useState(false)

  const round = useCallback(() => {
    const { width: parentWidth, height: parentHeight } = parentSize
    if (!parentWidth || !parentHeight || isRounded) return

    const allCells = cellsState.allCells || []
    if (!allCells.length) return

    const roundHeight = height - (width / parentWidth) * parentHeight
    const flexBlocks:[number, number][] = [[0, height]]

    allCells
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
      allCells.forEach((cell:CellType) => {
        const { y } = cell
        if ((fy + (fh - flexHeight)) < y) {
          cell.y = y - flexHeight
        }
      })
    })

    setIsRounded(true)

    dispatchCellsState([{
      type: 'update',
      payload: { cells: [...allCells] },
    }])

  }, [parentSize, width, height, cellsState])

  return useMemo(() => [isRounded, round], [round, isRounded])
}
