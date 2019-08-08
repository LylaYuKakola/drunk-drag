/**
 * @desc dispatch对应action的执行处理函数
 */

import * as tj from '../util/typeJudgement'
import { CellsStateType, CellType, ReducerPayloadType } from '../typings'
import { MIN_HEIGHT_OF_CELL, MIN_WIDTH_OF_CELL } from '../util/constVariables'
import { getCellId } from '../util/guid'
import deepCopy from '../util/deepCopy'

type PositionType = [number, number]
type GetCurrentTouchedCellType = <T extends CellType>(allCells: T[], touchedPosition:PositionType) => T
type HandlerType = (prevState?:CellsStateType, payload?:ReducerPayloadType) => CellsStateType

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

export const doUpdate:HandlerType = (prevState, payload) => {
  return {
    ...prevState,
    allCells: payload.cells || [],
    selectedCells: [],
  }
}

export const doClick:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  const [positionX, positionY] = payload.data
  if (!tj.isUsableNumber(positionX) || !tj.isUsableNumber(positionY)) return prevState
  const currentCell = getCurrentTouchedCell(allCells, [positionX, positionY])
  if (currentCell) {
    selectedCells = [currentCell]
  } else {
    selectedCells = []
  }
  return {
    ...prevState,
    selectedCells,
  }
}

export const doMultiClick:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  const [positionX, positionY] = payload.data
  if (!tj.isUsableNumber(positionX) || !tj.isUsableNumber(positionY)) return prevState
  const currentCell = getCurrentTouchedCell(allCells, [positionX, positionY])
  if (currentCell) {
    selectedCells = [...selectedCells, currentCell]
  }
  return { ...prevState, selectedCells }
}

export const doSelect:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let selectedCells
  const { keys } = payload
  if (!keys || !(tj.isArray(keys)) || !keys.length) return prevState
  selectedCells = allCells.filter((cell:CellType) => {
    return keys.includes(cell.id)
  })
  return { ...prevState, selectedCells }
}

export const doAppendSelection:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  const { keys } = payload
  if (!keys || !(tj.isArray(keys)) || !keys.length) return prevState
  selectedCells = [...selectedCells, ...(allCells.filter((cell:CellType) => {
    return keys.includes(cell.id)
  }))]
  return { ...prevState, selectedCells }
}

export const doResize:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  let [resizeX, resizeY] = payload.data
  const direction = payload.direction || ''

  if (!tj.isUsableNumber(resizeX) ||
    !tj.isUsableNumber(resizeY) ||
    (!resizeX && !resizeY) ||
    !direction ||
    !selectedCells.length
  ) return prevState

  const currentCell = selectedCells[0]
  const { w: cw, h: ch } = currentCell
  if (direction.includes('l') && (cw - resizeX) < MIN_WIDTH_OF_CELL) {
    resizeX = cw - MIN_WIDTH_OF_CELL
  }
  if (direction.includes('r') && (cw + resizeX) < MIN_WIDTH_OF_CELL) {
    resizeX = MIN_WIDTH_OF_CELL - cw
  }
  if (direction.includes('t') && (ch - resizeY) < MIN_HEIGHT_OF_CELL) {
    resizeY = ch - MIN_HEIGHT_OF_CELL
  }
  if (direction.includes('b') && (ch + resizeY) < MIN_HEIGHT_OF_CELL) {
    resizeY = MIN_HEIGHT_OF_CELL - ch
  }

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
  return { ...prevState, allCells, selectedCells }
}

export const doMove:HandlerType = (prevState, payload) => {
  const { allCells, selectedCells } = prevState
  const [moveX, moveY] = payload.data
  if (!tj.isUsableNumber(moveX) || !tj.isUsableNumber(moveY)) return prevState
  if (moveX || moveY) {
    selectedCells.forEach((cell:CellType) => {
      cell.x += moveX
      cell.y += moveY
    })
  }
  return { ...prevState, allCells, selectedCells }
}

export const doAdd:HandlerType = (prevState, payload) => {
  let { allCells, selectedCells } = prevState
  const newCell = payload.cell
  if (newCell) return prevState
  newCell.id = getCellId(newCell.id) // id允许重复
  allCells = [...allCells, newCell]
  selectedCells = [...selectedCells, newCell]
  return { ...prevState, allCells, selectedCells }
}

export const doPaste:HandlerType = (prevState) => {
  const { allCells, selectedCells } = prevState
  let newCells = deepCopy(selectedCells)
  if (!newCells || !newCells.length) return prevState
  newCells = newCells.map((cell:CellType) => {
    cell.id += `_copied_${Math.floor(Math.random() * 100)}`
    cell.x += (20 * Math.random())
    cell.y += (20 * Math.random())
    return cell
  })
  return { ...prevState, selectedCells, allCells: [...allCells, ...newCells] }
}

export const doDelete:HandlerType = (prevState) => {
  let { allCells, selectedCells } = prevState
  allCells = allCells.filter((cell:CellType) => {
    return !selectedCells.includes(cell)
  })
  selectedCells = []
  return { ...prevState, allCells, selectedCells }
}

export const doClean:HandlerType = (prevState) => {
  return { ...prevState, allCells: [], selectedCells: [] }
}

export const doHighest:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  const { keys } = payload
  if (!keys || !(tj.isArray(keys)) || !keys.length) return prevState
  const lowerCells:CellType[] = []
  const higherCells:CellType[] = []
  allCells.forEach((cell:CellType) => {
    if (keys.includes(cell.id)) {
      higherCells.push(cell)
    } else {
      lowerCells.push(cell)
    }
  })
  return {
    ...prevState,
    allCells: [...lowerCells, ...higherCells],
  }
}

export const doLowest:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  const { keys } = payload
  if (!keys || !(tj.isArray(keys)) || !keys.length) return prevState
  const lowerCells:CellType[] = []
  const higherCells:CellType[] = []
  allCells.forEach((cell:CellType) => {
    if (keys.includes(cell.id)) {
      lowerCells.push(cell)
    } else {
      higherCells.push(cell)
    }
  })
  return {
    ...prevState,
    allCells: [...lowerCells, ...higherCells],
  }
}

export const doChangeLoading:HandlerType = (prevState, payload) => {
  return {
    ...prevState,
    loading: payload.loading,
  }
}

export const doShowWrongLoaded:HandlerType = (prevState, payload) => {
  return {
    ...prevState,
    wrongLoaded: payload.wrongLoaded,
  }
}
