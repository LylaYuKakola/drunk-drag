/**
 * @desc 针对cell的核心操作
 *
 * 包括点击
 * 选中、移动、伸缩、删除、新增、清空所有cell、cell在z轴上下浮动的操作
 *
 * 不对外开放的操作，更新editor和viewer的唯一方式！！！！！！！
 */

import * as React from 'react'
import { ElementConfig, ViewportConfig, ReducerAction, CellsState } from '../typings'
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

const { useReducer, useCallback, useRef, useEffect } = React
interface Dispatcher {
  elements: ElementConfig[],
  viewports: ViewportConfig[],
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

  const actionsQueue = useRef<ReducerAction[][]>([])
  const animationFrameTimer = useRef<number>(0)

  const [state, dispatch] = useReducer(reducer, {
    allElements: elements || [],
    allViewports: viewports || [],
    selectedElements: [],
    selectedViewports: [],
  })

  // 在此处进行 actionsQueue 的入栈操作
  const dispatchWithActionsQueue = useCallback((actions:ReducerAction[]) => {
    actionsQueue.current.push(actions)
  }, [])

  // @explain
  // 真实的dispatch不对外暴露，而暴露的 dispatchWithActionsQueue
  // dispatchWithActionsQueue 仅提供一个actions入栈的操作，具体由 requestAnimationFrame 循环执行
  // requestAnimationFrame通过不断监听 actionsQueue，进行actions的合并执行，并清空 actionsQueue

  // 执行函数
  const run = useCallback(() => {
    const aq = actionsQueue.current

    // 执行actions并清空actions
    if (aq && aq.length) {
      const allActions:ReducerAction[] = []
      aq.forEach((actions:ReducerAction[] = []) => allActions.push(...actions))
      if (allActions.length > 0) {
        dispatch(allActions)
      }
      actionsQueue.current = []
    }

    animationFrameTimer.current = requestAnimationFrame(run)
  }, [dispatch])

  useEffect(() => {
    animationFrameTimer.current = requestAnimationFrame(run)
    return () => {
      clearTimeout(animationFrameTimer.current)
    }
  }, [])

  return [state, dispatchWithActionsQueue]
}
