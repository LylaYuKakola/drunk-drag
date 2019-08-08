/**
 * @desc 针对cell的核心操作
 *
 * 包括点击
 * 选中、移动、伸缩、删除、新增、清空所有cell、cell在z轴上下浮动的操作
 *
 * 不对外开放的操作，更新editor和viewer的唯一方式！！！！！！！
 */

import * as React from 'react'
import { CellType, CellsStateType, ReducerActionType } from '../typings'
import { getCellId } from '../util/guid'
import Timeout = NodeJS.Timeout
import {
  doUpdate,
  doPaste,
  doClick,
  doMultiClick,
  doSelect,
  doAppendSelection,
  doResize,
  doMove,
  doAdd,
  doDelete,
  doClean,
  doHighest,
  doLowest,
  doChangeLoading,
  doShowWrongLoaded,
} from './handlers'

const { useReducer, useCallback, useRef, useEffect } = React
const REVERT_STACK_TIMEOUT_NUM = 400

/**
 * @param cells
 */
export default function dispatcher(
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
          isAllCellsChanged = true
          break
        case 'copy':
          copied.current = true
          break
        case 'paste':
          if (copied.current) {
            currentState = doPaste(currentState)
          }
          isAllCellsChanged = true
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
          currentState = doRevert(currentState)
          break
        case 'showLoading':
          currentState = doChangeLoading(currentState, { loading: true })
          currentState = doShowWrongLoaded(currentState, { wrongLoaded: false })
          break
        case 'failLoaded':
          currentState = doChangeLoading(currentState, { loading: false })
          currentState = doShowWrongLoaded(currentState, { wrongLoaded: true })
          break
        case 'succeedLoaded':
          currentState = doChangeLoading(currentState, { loading: false })
          currentState = doShowWrongLoaded(currentState, { wrongLoaded: false })
          break
        case 'loadAsync':
          doLoadAsync(currentState, payload) // 异步处理，对当前的state不做修改
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
      }, REVERT_STACK_TIMEOUT_NUM)
    }
    return currentState
  }, [])

  const doRevert = useCallback((pervState) => {
    if (revertedStack.current.length < 2) {
      return {
        allCells: JSON.parse(revertedStack.current[0]),
        selectedCells:[],
      }
    }
    revertedStack.current.pop()
    return {
      ...pervState,
      allCells: JSON.parse(revertedStack.current[revertedStack.current.length - 1]),
      selectedCells:[],
    }
  }, [])

  const doLoadAsync = useCallback((pervState, { cellsAsync }) => {
    Promise.resolve(cellsAsync).then((c: CellType[]) => {
      dispatch([{
        type: 'update',
        payload: {
          cells: c.map(cell => ({ id: getCellId(cell.id), ...cell })),
        },
      }, { type: 'succeedLoaded' }])
    }, (error) => {
      // @TODO 吞了一个错
      console.error(error)
      dispatch([{
        type: 'update',
        payload: {
          cells: [],
        },
      }, { type: 'failLoaded' }])
    })
  }, [])

  const [state, dispatch] = useReducer(reducer, {
    allCells: [],
    selectedCells: [],
    loading: false,
    wrongLoaded: false,
  })

  useEffect(() => {
    dispatch([{
      type: 'loadAsync',
      payload: {
        cellsAsync: cells,
      },
    }])
  }, [])

  return [state, dispatch]
}
