import * as React from 'react'
import { StateOfReducerType } from '../../../../typings'
import Cell from '../../../Cell'

const { useMemo } = React

export default function useCells(cellsState:StateOfReducerType):any[] {
  return useMemo(() => {
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
