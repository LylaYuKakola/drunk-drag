import * as React from 'react'
import Cell from '../../../Cell'
import { CellsStateType } from '../../../../typings'

const { useMemo } = React

export default function useCells(cellsState:CellsStateType):any[] {
  return useMemo<any[]|null>(() => {
    const { allCells, selectedCells } = cellsState
    return allCells.map((cell, index) => (
      <Cell
        {...cell}
        isSelected={selectedCells && selectedCells.includes(cell)}
        isPurePage={false}
        index={index}
        key={index}
      />
    ))
  }, [cellsState])
}
