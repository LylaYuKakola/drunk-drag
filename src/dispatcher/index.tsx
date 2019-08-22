/**
 * @desc 针对cell的核心操作
 *
 * 包括点击
 * 选中、移动、伸缩、删除、新增、清空所有cell、cell在z轴上下浮动的操作
 *
 * 不对外开放的操作，更新editor和viewer的唯一方式！！！！！！！
 */

import * as React from 'react'
import { ElementProps, ViewportProps, ReducerAction, CellsState } from '../typings'
import {
  doUpdate,
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
} from './handlers'

const { useReducer, useCallback } = React
interface Dispatcher {
  elements: ElementProps[],
  viewports: ViewportProps[],
}

/**
 * @param cells
 */
export default function dispatcher({ elements, viewports }: Dispatcher):[any, any] {
  const reducer = useCallback((
    state:CellsState,
    actions:ReducerAction[],
  ):CellsState  => {
    let currentState = state
    let isAllCellsChanged = false
    actions.forEach((action: any) => {
      const { type, payload } = action
      switch (type) {
        case 'update':
          currentState = doUpdate(currentState, payload)
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
        default:
          console.warn('cell没有这个操作')
          break
      }
    })
    if (isAllCellsChanged) {
     // @TODO
    }
    return currentState
  }, [])

  const [state, dispatch] = useReducer(reducer, {
    allElements: elements || [],
    allViewports: viewports || [],
    selectedElements: [],
    selectedViewports: [],
    loading: false, // @TODO 暂时没用
    loadedWithError: false, // @TODO 暂时没用 这个字段用来处理异步错误
  })

  return [state, dispatch]
}
