import * as React from 'react'
import Viewport from '../components/Viewport'
import { CellsState } from '../typings'

const { useMemo } = React

export default function useCells(cellsState:CellsState, isViewer:boolean = false):any[] {
  return useMemo<any[]|null>(() => {
    const { allViewports, selectedViewports } = cellsState
    return allViewports.map((viewport, index) => (
      <Viewport
        {...viewport}
        isSelected={selectedViewports && selectedViewports.includes(viewport)}
        isViewer={isViewer}
        index={index}
        key={index}
      />
    ))
  }, [cellsState])
}
