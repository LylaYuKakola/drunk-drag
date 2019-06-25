/**
 * @desc 针对cell的核心操作
 *
 * 包括点击
 * 选中、移动、伸缩、删除、新增、清空所有cell、cell在z轴上下浮动的操作
 *
 * 不对外开放的操作，更新editor和viewer的唯一方式！！！！！！！
 */

import * as React from 'react'
import { CellType, CellsStateType, ReducerActionType, ReducerPayloadType } from '../typings'
import { getCellId } from '../util/guid'
import * as tj from '../util/typeJudgement'
import Timeout = NodeJS.Timeout
import { MIN_HEIGHT_OF_CELL, MIN_WIDTH_OF_CELL } from '../util/constVariables'
import deepCopy from '../util/deepCopy'

const { useReducer, useCallback, useRef, useEffect } = React

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

const doUpdate:HandlerType = (prevState, payload) => {
  return { allCells: payload.cells || [], selectedCells: [] }
}

const doClick:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  const [positionX, positionY] = payload.data
  if (tj.cannotNumberUsed(positionX) || tj.cannotNumberUsed(positionY)) return prevState
  const currentCell = getCurrentTouchedCell(allCells, [positionX, positionY])
  if (currentCell) {
    selectedCells = [currentCell]
  } else {
    selectedCells = []
  }
  return { allCells, selectedCells }
}

const doMultiClick:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  const [positionX, positionY] = payload.data
  if (tj.cannotNumberUsed(positionX) || tj.cannotNumberUsed(positionY)) return prevState
  const currentCell = getCurrentTouchedCell(allCells, [positionX, positionY])
  if (currentCell) {
    selectedCells = [...selectedCells, currentCell]
  }
  return { allCells, selectedCells }
}

const doSelect:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let selectedCells
  const { keys } = payload
  if (!keys || !(tj.isArray(keys)) || !keys.length) return prevState
  selectedCells = allCells.filter((cell:CellType) => {
    return keys.includes(cell.id)
  })
  return { selectedCells, allCells: prevState.allCells }
}

const doAppendSelection:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  const { keys } = payload
  if (!keys || !(tj.isArray(keys)) || !keys.length) return prevState
  selectedCells = [...selectedCells, ...(allCells.filter((cell:CellType) => {
    return keys.includes(cell.id)
  }))]
  return { allCells, selectedCells }
}

const doResize:HandlerType = (prevState, payload) => {
  const { allCells } = prevState
  let { selectedCells } = prevState
  let [resizeX, resizeY] = payload.data
  const direction = payload.direction || ''

  if (tj.cannotNumberUsed(resizeX) ||
    tj.cannotNumberUsed(resizeY) ||
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
  return { allCells, selectedCells }
}

const doMove:HandlerType = (prevState, payload) => {
  const { allCells, selectedCells } = prevState
  const [moveX, moveY] = payload.data
  if (tj.cannotNumberUsed(moveX) || tj.cannotNumberUsed(moveY)) return prevState
  if (moveX || moveY) {
    selectedCells.forEach((cell:CellType) => {
      cell.x += moveX
      cell.y += moveY
    })
  }
  return { allCells, selectedCells }
}

const doAdd:HandlerType = (prevState, payload) => {
  let { allCells, selectedCells } = prevState
  const newCell = payload.cell
  if (newCell) return prevState
  newCell.id = getCellId(newCell.id) // id允许重复
  allCells = [...allCells, newCell]
  selectedCells = [...selectedCells, newCell]
  return { allCells, selectedCells }
}

const doPaste:HandlerType = (prevState) => {
  const { allCells, selectedCells } = prevState
  let newCells = deepCopy(selectedCells)
  if (!newCells || !newCells.length) return prevState
  newCells = newCells.map((cell:CellType) => {
    cell.id += `_copied_${Math.floor(Math.random() * 100)}`
    cell.x += (20 * Math.random())
    cell.y += (20 * Math.random())
    return cell
  })
  return { selectedCells, allCells: [...allCells, ...newCells] }
}

const doDelete:HandlerType = (prevState) => {
  let { allCells, selectedCells } = prevState
  allCells = allCells.filter((cell:CellType) => {
    return !selectedCells.includes(cell)
  })
  selectedCells = []
  return { allCells, selectedCells }
}

const doClean:HandlerType = () => {
  return { allCells: [], selectedCells: [] }
}

const doHighest:HandlerType = (prevState, payload) => {
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
    allCells: [...lowerCells, ...higherCells],
    selectedCells: prevState.selectedCells,
  }
}

const doLowest:HandlerType = (prevState, payload) => {
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
    allCells: [...lowerCells, ...higherCells],
    selectedCells: prevState.selectedCells,
  }
}

/**
 * @param cells
 */
export default function useCellsReducer(
  cells: CellType[]|Promise<CellType[]>,
):[any, any] {
  const revertedStack = useRef<string[]>([JSON.stringify(cells)])
  const timeoutToPushStack = useRef<Timeout>()
  const copied = useRef<boolean>(false)

  const reducer = useCallback((
    state:CellsStateType,
    actions:ReducerActionType[],
  ):CellsStateType  => {
    let currentState = state
    let isAllCellsChanged = false
    clearTimeout(timeoutToPushStack.current)
    actions.forEach((action: any) => {
      const { type, payload } = action
      switch (type) {
        case 'update':
          currentState = doUpdate(currentState, payload)
          break
        case 'copy':
          copied.current = true
          break
        case 'paste':
          if (copied.current) {
            currentState = doPaste(currentState)
          }
          break
        case 'click':
          currentState = doClick(currentState, payload)
          break
        case 'multiClick':
          currentState = doMultiClick(currentState, payload)
          break
        case 'select':
          currentState = doSelect(currentState, payload)
          break
        case 'appendSelection':
          currentState = doAppendSelection(currentState, payload)
          break
        case 'resize':
          currentState = doResize(currentState, payload)
          isAllCellsChanged = true
          break
        case 'move':
          currentState = doMove(currentState, payload)
          isAllCellsChanged = true
          break
        case 'add':
          currentState = doAdd(currentState, payload)
          isAllCellsChanged = true
          break
        case 'delete':
          currentState = doDelete(currentState)
          isAllCellsChanged = true
          break
        case 'clean':
          currentState = doClean()
          isAllCellsChanged = true
          break
        case 'highest':
          currentState = doHighest(currentState, payload)
          isAllCellsChanged = true
          break
        case 'lowest':
          currentState = doLowest(currentState, payload)
          isAllCellsChanged = true
          break
        case 'revert':
          currentState = doRevert()
          break
        default:
          console.warn('cell没有这个操作')
          break
      }
    })
    if (isAllCellsChanged) {
      timeoutToPushStack.current = setTimeout(() => {
        revertedStack.current.push(JSON.stringify(currentState.allCells))
        if (revertedStack.current.length > 10) revertedStack.current.shift()
      }, 400)
    }
    return currentState
  }, [])

  const doRevert = useCallback<HandlerType>(() => {
    if (revertedStack.current.length < 2) {
      return {
        allCells: JSON.parse(revertedStack.current[0]),
        selectedCells:[],
      }
    }
    revertedStack.current.pop()
    return {
      allCells: JSON.parse(revertedStack.current[revertedStack.current.length - 1]),
      selectedCells:[],
    }
  }, [])

  const [state, dispatch] = useReducer(reducer, {
    allCells: [],
    selectedCells: [],
  })

  useEffect(() => {
    Promise.resolve(cells).then((c: CellType[]) => {
      dispatch([{
        type: 'update',
        payload: { cells: c.map(cell => ({ id: getCellId(cell.id), ...cell })) },
      }])
    })
  }, [])

  return [state, dispatch]
}
