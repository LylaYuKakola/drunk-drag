/**
 * @desc dispatch对应action的执行处理函数
 */

import * as tj from '../util/typeJudgement'
import { CellsState, ElementAndViewportProps, ReducerPayload } from '../typings'
import { MIN_HEIGHT_OF_CELL, MIN_WIDTH_OF_CELL } from '../util/constants'
import getKeysInStateByTagName from '../util/getKeysInStateByTagName'
import { getCellId } from '../util/guid'

type PositionType = [number, number]
type GetCurrentTouchedCell = <T extends ElementAndViewportProps>(allCells: T[], touchedPosition:PositionType) => T
type HandlerType = (prevState?:CellsState, payload?:ReducerPayload) => CellsState

interface ResizePayloadData {
  direction: string,
  resize: [number, number],
}
interface MovePayloadData {
  move: [number, number],
}
interface AddPayloadData {
  cells: ElementAndViewportProps[],
}

/**
 * 获取点击到的cell
 * @param allCells (在传参数之前区分 viewports 和 elements)
 * @param touchedPosition
 */
const getCurrentTouchedCell:GetCurrentTouchedCell = (allCells, touchedPosition) => {
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

export const doUpdate:HandlerType = (
  prevState,
  payload,
) => {
  const { tag, data } = payload
  const { key, selectedKey } = getKeysInStateByTagName(tag)
  return {
    ...prevState,
    [key]: data || [],
    [selectedKey]: [],
  }
}

export const doClick:HandlerType = (prevState, payload) => {
  const { tag, data } = payload
  const { click: [positionX, positionY] } = data
  const { key, selectedKey, otherSelectedKey } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)
  const currentCell = getCurrentTouchedCell(
    allCellsWithTagName,
    [positionX, positionY],
  )
  if (!currentCell) return { ...prevState, [selectedKey]: [], [otherSelectedKey]: [] }
  return { ...prevState, [selectedKey]: [currentCell], [otherSelectedKey]: [] }
}

export const doMultiClick:HandlerType = (prevState, payload) => {
  const { tag, data: [positionX, positionY] } = payload
  const { key, selectedKey, otherSelectedKey } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)
  const selectedCellsWithTagName = Reflect.get(prevState, selectedKey)

  const currentCell = getCurrentTouchedCell(allCellsWithTagName, [positionX, positionY])
  if (!currentCell) return { ...prevState, [selectedKey]: [], [otherSelectedKey]: [] }
  return {
    ...prevState,
    [selectedKey]: [...new Set([...selectedCellsWithTagName, currentCell])],
    [otherSelectedKey]: [],
  }
}

export const doSelect:HandlerType = (prevState, payload) => {
  const { tag, ids } = payload
  if (!ids || !(tj.isArray(ids)) || !ids.length) return prevState
  const { key, selectedKey } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)

  const selected = allCellsWithTagName.filter((cell:ElementAndViewportProps) => {
    return ids.includes(cell.id)
  })
  return { ...prevState, [selectedKey]: selected }
}

export const doAppendSelection:HandlerType = (prevState, payload) => {
  const { tag, ids } = payload
  if (!ids || !(tj.isArray(ids)) || !ids.length) return prevState

  const { key, selectedKey } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)
  const selectedCellsWithTagName = Reflect.get(prevState, selectedKey)

  const newSelected = allCellsWithTagName.filter((cell:ElementAndViewportProps) => {
    return ids.includes(cell.id)
  })
  return {
    ...prevState,
    [selectedKey]: [...new Set([...selectedCellsWithTagName, ...newSelected])],
  }
}

export const doResize:HandlerType = (prevState, payload) => {
  const tag = payload.tag
  const data:ResizePayloadData = payload.data || {}
  const direction = data.direction
  let [resizeX, resizeY] = data.resize

  const { key, selectedKey } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)
  const selectedCellsWithTagName = Reflect.get(prevState, selectedKey)

  if (!selectedCellsWithTagName.length) return prevState

  // 只针对第一个选中的进行resize
  const currentCell = selectedCellsWithTagName[0]
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
  return {
    ...prevState,
    [key]: allCellsWithTagName,
    [selectedKey]: [currentCell],
  }
}

export const doMove:HandlerType = (prevState, payload) => {
  const tag = payload.tag
  const { move: [moveX, moveY] }:MovePayloadData = payload.data
  const { selectedKey } = getKeysInStateByTagName(tag)
  const selectedCellsWithTagName = Reflect.get(prevState, selectedKey)

  if (moveX || moveY) {
    selectedCellsWithTagName.forEach((cell:ElementAndViewportProps) => {
      cell.x += moveX
      cell.y += moveY
    })
  }
  return {
    ...prevState,
    [selectedKey]: [...selectedCellsWithTagName],
  }
}

export const doAdd:HandlerType = (prevState, payload) => {
  const tag = payload.tag
  const { cells }:AddPayloadData = payload.data
  if (!cells || !cells.length) return prevState
  const { key } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)
  cells.forEach((newCell:ElementAndViewportProps) => {
    newCell.id = getCellId(newCell.id)
  })
  return {
    ...prevState,
    [key]: [...new Set([...allCellsWithTagName, ...cells])],
  }
}

export const doDelete:HandlerType = (prevState, payload) => {
  const tag = payload.tag
  const { key, selectedKey } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)
  const selectedCellsWithTagName = Reflect.get(prevState, selectedKey)

  return {
    ...prevState,
    [key]: allCellsWithTagName.filter((cell:ElementAndViewportProps) => {
      return !selectedCellsWithTagName.includes(cell)
    }),
    [selectedKey]: [],
  }
}

export const doClean:HandlerType = (prevState) => {
  return {
    ...prevState,
    allElements: [],
    allViewports: [],
    selectedElements: [],
    selectedViewports: [],
  }
}

export const doHighest:HandlerType = (prevState, payload) => {
  const { tag, ids } = payload
  if (!ids || !ids.length) return prevState

  const { key } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)

  const lowerCells:ElementAndViewportProps[] = []
  const higherCells:ElementAndViewportProps[] = []
  allCellsWithTagName.forEach((cell:ElementAndViewportProps) => {
    if (ids.includes(cell.id)) {
      higherCells.push(cell)
    } else {
      lowerCells.push(cell)
    }
  })

  return {
    ...prevState,
    [key]: [...lowerCells, ...higherCells],
  }
}

export const doLowest:HandlerType = (prevState, payload) => {
  const { tag, ids } = payload
  if (!ids || !ids.length) return prevState

  const { key } = getKeysInStateByTagName(tag)
  const allCellsWithTagName = Reflect.get(prevState, key)

  const lowerCells:ElementAndViewportProps[] = []
  const higherCells:ElementAndViewportProps[] = []
  allCellsWithTagName.forEach((cell:ElementAndViewportProps) => {
    if (ids.includes(cell.id)) {
      lowerCells.push(cell)
    } else {
      higherCells.push(cell)
    }
  })

  return {
    ...prevState,
    [key]: [...lowerCells, ...higherCells],
  }
}
