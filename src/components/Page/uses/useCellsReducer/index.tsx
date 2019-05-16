import * as React from 'react'
import { CellPropsType, StateOfReducerType, ActionOfReducerType } from '../../../../typings'
import { guid } from '../../../../util/guid'
import {
  MIN_HEIGHT_OF_CELL,
  MIN_WIDTH_OF_CELL,
} from '../../../../util/constVariables'

const { useState, useReducer, useCallback } = React

export default function useCellsReducer(
  cells: CellPropsType[],
  pageWidth: number,
  pageHeight: number,
) {
  const initialState:StateOfReducerType = useState({
    allCells: cells,
    selectedCells: [],
  })[0] // 完全非受控

  const reducer = useCallback((
    state:StateOfReducerType,
    actions:ActionOfReducerType[],
  ):StateOfReducerType  => {
    let { allCells, selectedCells } = state

    actions.forEach((action: any) => {
      const { type, payload } = action

      switch (type) {
        case 'addSelected':
          {
            const { key, keys } = payload
            const allKeys = [...new Set([key, ...(keys || [])])]
            const newSelectedCells = allCells.filter((cell:CellPropsType) => {
              return allKeys.includes(cell.id)
            })
            selectedCells = [...selectedCells, ...newSelectedCells]
            break
          }
        case 'clearSelected':
          {
            selectedCells = []
            break
          }
        case 'resize':
          {
            const key = payload.key
            const [resizeX, resizeY] = payload.data || [0, 0]
            const direction = payload.direction || ''

            if (!key) break
            if (!resizeX && !resizeY) break
            if (!direction) break

            const currentCell = allCells.find((cell:CellPropsType) => {
              return key === cell.id
            })

            // left
            if (direction.includes('l')) {
              currentCell.x += resizeX
              currentCell.w -= resizeX
            }
            // right
            if (direction.includes('r')) {
              currentCell.w += resizeX
            }
            // top
            if (direction.includes('t')) {
              currentCell.y += resizeY
              currentCell.h -= resizeY
            }
            // bottom
            if (direction.includes('b')) {
              currentCell.h += resizeY
            }
            controlCellSize(currentCell, direction)
            selectedCells = [currentCell]
            break
          }
        case 'move':
          {
            const [moveX, moveY] = payload.data || [0, 0]
            if (moveX || moveY) {
              selectedCells.forEach((cell:CellPropsType) => {
                cell.x += moveX
                cell.y += moveY
                controlCellPosition(cell)
              })
            }
            break
          }
        case 'add':
          {
            const newCell = payload.cell
            if (newCell) break
            newCell.id = newCell.id || `cell-${guid()}` // id允许重复
            allCells = [...allCells, newCell]
            break
          }
        case 'delete':
          {
            const { key, keys } = payload
            const allKeys = [...new Set([key, ...(keys || [])])]
            allCells = allCells.filter((cell:CellPropsType) => {
              return allKeys.includes(cell.id)
            })
            break
          }
        case 'up':
          {
            const { key } = payload
            if (!key) break
            const currentCellIndex = allCells.findIndex((cell:CellPropsType) => {
              return key === cell.id
            })
            if (currentCellIndex < 0) {
              console.warn('没找着')
              break
            }
            if ((currentCellIndex + 1) >= allCells.length) {
              console.warn('已经在最上边了')
              break
            }
            [allCells[currentCellIndex + 1], allCells[currentCellIndex]] = [allCells[currentCellIndex], allCells[currentCellIndex + 1]]
            break
          }
        case 'down':
          {
            const { key } = payload
            if (!key) break
            const currentCellIndex = allCells.findIndex((cell:CellPropsType) => {
              return key === cell.id
            })
            if (currentCellIndex < 0) {
              console.warn('没找着')
              break
            }
            if ((currentCellIndex - 1) < 0) {
              console.warn('已经在最下边了')
              break
            }
            [allCells[currentCellIndex - 1], allCells[currentCellIndex]] = [allCells[currentCellIndex], allCells[currentCellIndex - 1]]
            break
          }
        default:
          console.warn('没有这个指令')
          break
      }
    })
    return { allCells, selectedCells }
  }, [])

  const controlCellSize = useCallback((cell:CellPropsType, direction:string) => {
    let { x, y, w, h } = cell
    if (x < 0) { w = w + x; x = 0 }
    if ((x + w) > pageWidth) { w = pageWidth - x }
    if (y < 0) { h = h + y; y = 0 }
    if ((y + h) > pageHeight) { h = pageHeight - y }
    if (w < MIN_WIDTH_OF_CELL) {
      if (direction.includes('l')) x = x + w - MIN_WIDTH_OF_CELL
      w = MIN_WIDTH_OF_CELL
    }
    if (h < MIN_HEIGHT_OF_CELL) {
      if (direction.includes('t')) y = y + h - MIN_HEIGHT_OF_CELL
      h = MIN_HEIGHT_OF_CELL
    }
    cell.x = x
    cell.y = y
    cell.w = w
    cell.h = h
  }, [pageHeight, pageWidth])

  const controlCellPosition = useCallback((cell:CellPropsType) => {
    const { x, y, w, h } = cell
    if (x < 0) cell.x = 0
    if (y < 0) cell.y = 0
    if ((x + w) > pageWidth) cell.x = pageWidth - w
    if ((y + h) > pageHeight) cell.y = pageHeight - h
  }, [pageHeight, pageWidth])

  return useReducer(reducer, initialState)
}
