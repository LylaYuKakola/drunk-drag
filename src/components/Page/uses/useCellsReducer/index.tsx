/**
 * @desc cells的相关操作
 */

import * as React from 'react'
import { CellType, CellsStateType, ReducerActionType } from '../../../../typings'
import guid  from '../../../../util/guid'
import * as tj from '../../../../util/typeJudgement'

const { useState, useReducer, useCallback, useRef } = React

type PositionType = [number, number]
type GetCurrentTouchedCellType = <T extends CellType>(allCells: T[], touchedPosition:PositionType) => T

/**
 * 获取点击到的cell
 * @param allCells
 * @param touchedPosition
 */
const getCurrentTouchedCell:GetCurrentTouchedCellType = (allCells, touchedPosition) => {
  const [startX, startY] = touchedPosition
  let index = allCells.length - 1
  while (index >= 0) {
    const cell = allCells[index]
    const { x, y, h, w } = cell
    if ((startX >= x) &&
      (startX <= (x + w)) &&
      (startY >= y) &&
      (startY <= (y + h))
    ) {
      return cell
    }
    index -= 1
  }
}

export default function useCellsReducer(
  cells: CellType[],
) {
  const initialState:CellsStateType = useState({
    allCells: cells,
    selectedCells: [],
  })[0] // 完全非受控

  const revertStack = useRef<any[][]>([])

  const reducer = useCallback((
    state:CellsStateType,
    actions:ReducerActionType[],
  ):CellsStateType  => {
    let { allCells, selectedCells } = state

    actions.forEach((action: any) => {
      const { type, payload } = action

      switch (type) {
        case 'click':
          {
            const [positionX, positionY] = payload.data
            if (tj.cannotNumberUsed(positionX) || tj.cannotNumberUsed(positionY)) break
            const currentCell = getCurrentTouchedCell(allCells, [positionX, positionY])
            if (currentCell) {
              selectedCells = [currentCell]
            } else {
              selectedCells = []
            }
            break
          }
        case 'multiClick':
          {
            const [positionX, positionY] = payload.data
            if (tj.cannotNumberUsed(positionX) || tj.cannotNumberUsed(positionY)) break
            const currentCell = getCurrentTouchedCell(allCells, [positionX, positionY])
            if (currentCell) {
              selectedCells = [...selectedCells, currentCell]
            }
            break
          }
        case 'select':
          {
            const { keys } = payload
            if (!keys || !(keys instanceof Array) || !keys.length) break
            selectedCells = allCells.filter((cell:CellType) => {
              return keys.includes(cell.id)
            })
            break
          }
        case 'appendSelection':
          {
            const { keys } = payload
            if (!keys || !(keys instanceof Array) || !keys.length) break
            selectedCells = [...selectedCells, ...(allCells.filter((cell:CellType) => {
              return keys.includes(cell.id)
            }))]
            break
          }
        case 'clearSelection':
          {
            selectedCells = []
            break
          }
        case 'resize':
          {
            const [resizeX, resizeY] = payload.data
            if (tj.cannotNumberUsed(resizeX) || tj.cannotNumberUsed(resizeY)) break
            const direction = payload.direction || ''

            if (!resizeX && !resizeY) break
            if (!direction) break
            if (!selectedCells.length) break

            const currentCell = selectedCells[0]

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
            selectedCells = [currentCell]
            break
          }
        case 'move':
          {
            const [moveX, moveY] = payload.data
            if (tj.cannotNumberUsed(moveX) || tj.cannotNumberUsed(moveY)) break
            if (moveX || moveY) {
              selectedCells.forEach((cell:CellType) => {
                cell.x += moveX
                cell.y += moveY
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
            allCells = allCells.filter((cell:CellType) => {
              return !selectedCells.includes(cell)
            })
            selectedCells = []
            break
          }
        case 'up':
          {
            if (!selectedCells.length) break
            const currentCellIndex = allCells.findIndex((cell:CellType) => {
              return cell === selectedCells[0]
            })
            if (currentCellIndex < 0) {
              console.warn('没找着')
              break
            }
            if ((currentCellIndex - 1) < 0) {
              console.warn('已经在最下边了')
              break
            }
            [allCells[currentCellIndex + 1], allCells[currentCellIndex]] =
              [allCells[currentCellIndex], allCells[currentCellIndex + 1]]
            break
          }
        case 'down':
          {
            if (!selectedCells.length) break
            const currentCellIndex = allCells.findIndex((cell:CellType) => {
              return cell === selectedCells[0]
            })
            if (currentCellIndex < 0) {
              console.warn('没找着')
              break
            }
            if ((currentCellIndex - 1) < 0) {
              console.warn('已经在最下边了')
              break
            }
            [allCells[currentCellIndex - 1], allCells[currentCellIndex]] =
              [allCells[currentCellIndex], allCells[currentCellIndex - 1]]
            break
          }
        case 'revert':
          doRevert()
          break
        default:
          console.warn('没有这个指令')
          break
      }
    })
    return { allCells, selectedCells }
  }, [])

  const doRevert = useCallback(() => {
    let currentActions = revertStack.current.pop()
    while (!currentActions.length) {
      currentActions = revertStack.current.pop()
    }
    currentActions.forEach(({ action, target }) => {
      // const { type, payload } = action
      // const direction = payload.direction || ''
      //
      // switch (type) {
      //   case 'resize':
      //     // left
      //     if (direction.includes('l')) {
      //       currentCell.x += resizeX
      //       currentCell.w -= resizeX
      //     }
      //     // right
      //     if (direction.includes('r')) {
      //       currentCell.w += resizeX
      //     }
      //     // top
      //     if (direction.includes('t')) {
      //       currentCell.y += resizeY
      //       currentCell.h -= resizeY
      //     }
      //     // bottom
      //     if (direction.includes('b')) {
      //       currentCell.h += resizeY
      //     }
      //     break
      //   case 'move':
      //     break
      //   case 'delete':
      //     break
      //   case 'add':
      //     break
      //   case 'up':
      //     break
      //   case 'down':
      //     break
      // }
    })
  }, [])

  return useReducer(reducer, initialState)
}
