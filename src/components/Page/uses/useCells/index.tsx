import * as React from 'react'
import { CellPropsType } from '../../../../typings'
import Cell from '../../../Cell'

const { useMemo } = React

export default function useCells(cells:CellPropsType[], selectedCells?:CellPropsType[]):any[] {
  return useMemo(() => {
    return cells.map((cell, index) => (
      <Cell
        {...cell}
        isSelected={selectedCells && selectedCells.includes(cell)}
        isPurePage={false}
        index={index}
        key={index}
      />
    ))
  }, [cells, selectedCells])
}
