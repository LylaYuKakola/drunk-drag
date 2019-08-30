import * as React from 'react'
import Viewport from '../components/Viewport'
import { CellsState } from '../typings'
import {getCellId} from "../util/guid";

const { useMemo } = React

export default function useCells(cellsState:CellsState, isViewer:boolean = false):any[] {
  return useMemo<any[]|null>(() => {
    const { allViewports, selectedViewports } = cellsState
    return allViewports.map((e) => {
      e.id = getCellId(e.id)
      return e
    }).map((viewport, index) => (
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
