/**
 * @desc cell构建DOM，loading 和 wrongLoaded 在此处实现
 */

import * as React from 'react'
import Cell from './Cell'
import { CellsStateType } from '../../typings'

const { useMemo } = React

export default function useCells(cellsState:CellsStateType, isViewer:boolean = false):any[] {
  return useMemo<any[]|null>(() => {
    const { allCells, selectedCells } = cellsState
    return allCells.map((cell, index) => (
      <Cell
        {...cell}
        isSelected={selectedCells && selectedCells.includes(cell)}
        isViewer={isViewer}
        index={index}
        key={index}
      />
    ))
  }, [cellsState])
}
