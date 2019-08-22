import * as React from 'react'
import Element from '../components/Element'
import { CellsState } from '../typings'

const { useMemo } = React

export default function useCells(cellsState:CellsState, isViewer:boolean = false):any[] {
  return useMemo<any[]|null>(() => {
    const { allElements, selectedElements } = cellsState
    return allElements.map((element, index) => (
      <Element
        {...element}
        isSelected={selectedElements && selectedElements.includes(element)}
        isViewer={isViewer}
        index={index}
        key={index}
      />
    ))
  }, [cellsState])
}
