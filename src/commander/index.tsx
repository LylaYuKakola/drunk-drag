/**
 * @desc 提供editor、viewer和指令的挂接函数，同时规定部分editor和viewer组件实例的基本指令
 *
 * **以下提到的组件指的是editor和viewer的实例**
 *
 * 通过导出的connect方法和组件实例进行连接，开放给使用者一些操作组件内容的方法
 * 包括以下：
 * - 获取组件内的cell或者cells
 * - 修改对应cell的宽高
 * - 移动cell位置
 * - 增加/删除cell
 * - 清空所有cell
 *
 * 这些commander实际上通过执行dispatcher来修改组件
 *
 * 针对不同的组件（editor/viewer）有不同的扩展commander，在对应的组件代码目录下
 * commander是唯一从外部更新组件的方式！！！！！！
 */

import * as React from 'react'

import { ReducerActionType, CellType, CellsStateType } from '../typings'
import deepCopy from '../util/deepCopy'

type DispatchType = (actions: ReducerActionType[]) => void
type CellGetterType = (ids: string[]) => any
type CellFnType = (id:string) => CellType
type CellsFnType = (ids?:string[]) => CellType[]
type ResizeType = (id:string, data:[number, number, number, number]) => void
type ResizeToType = (id:string, data:[number, number, number, number]) => void
type MoveType = (id:string, data:[number, number]) => void
type MoveToType = (id:string, data:[number, number]) => void
type AddType = (cell:CellType) => void
type DeleteType = (ids?:string[]) => void
type CleanType = () => void

export interface CommandsType {
  cell: CellFnType,
  cells: CellsFnType,
  resize: ResizeType,
  resizeTo: ResizeToType,
  move: MoveType,
  moveTo: MoveToType,
  add: AddType,
  delete: DeleteType,
  clean: CleanType,
  [key:string]: any,
}

const { useMemo, useCallback } = React

/**
 * 指令方法
 * @param cellsState
 * @param dispatch
 */
export default function useCommander(cellsState:CellsStateType, dispatch:DispatchType) {

  const getCells = useCallback<CellGetterType>((ids) => {
    if (!cellsState.allCells || !cellsState.allCells.length) return []
    if (!ids) return deepCopy(cellsState.allCells)
    return deepCopy(
      cellsState.allCells.filter((cell:CellType) => ids.includes(cell.id)),
    )
  }, [cellsState.allCells])

  const commander = useMemo<CommandsType>(() => {
    return Object.freeze({
      cell(id) {
        return getCells([id])[0] || null
      },
      cells(ids) {
        return getCells(ids)
      },
      resize(id, data) {
        const [top, right, bottom, left] = data
        dispatch([{
          type: 'select',
          payload: {
            keys: [id],
          },
        }, {
          type: 'resize',
          payload: {
            keys: [id],
            data: [-top, -left],
            direction: 'lt',
          },
        }, {
          type: 'resize',
          payload: {
            keys: [id],
            data: [right, bottom],
            direction: 'rb',
          },
        }])
      },
      resizeTo(id, data) {
        const [top, right, bottom, left] = data
        const cell = getCells([id])[0] || null
        if (!cell) return
        const { x, y, w, h } = cell
        dispatch([{
          type: 'select',
          payload: {
            keys: [id],
          },
        }, {
          type: 'resize',
          payload: {
            keys: [id],
            data: [top - x, left - y],
            direction: 'lt',
          },
        }, {
          type: 'resize',
          payload: {
            keys: [id],
            data: [right - (x + w), bottom - (y + h)],
            direction: 'rb',
          },
        }])
      },
      move(id, data) {
        const [moveX, moveY] = data
        dispatch([{
          type: 'select',
          payload: {
            keys: [id],
          },
        }, {
          type: 'move',
          payload: {
            keys: [id],
            data: [moveX, moveY],
            direction: 'lt',
          },
        }])
      },
      moveTo(id, data) {
        const [moveToX, moveToY] = data
        const cell = getCells([id])[0] || null
        if (!cell) return
        const { x, y } = cell
        dispatch([{
          type: 'select',
          payload: {
            keys: [id],
          },
        }, {
          type: 'move',
          payload: {
            keys: [id],
            data: [moveToX - x, moveToY - y],
          },
        }])
      },
      add(cell) {
        dispatch([{
          type: 'add',
          payload: { cell },
        }])
      },
      delete(ids) {
        dispatch([{
          type: 'select',
          payload: {
            keys: ids ? ids : [],
          },
        }, {
          type: 'delete',
        }])
      },
      clean() {
        dispatch([{
          type: 'clean',
        }])
      },
      revert() {
        dispatch([{
          type: 'revert',
        }])
      },
    })
  }, [dispatch, getCells])

  return useCallback((reactElement:any, extra?:any) => {
    return new Proxy(reactElement, {
      get(target, key:string, receiver) {
        if (commander[key]) return Reflect.get(commander, key, receiver)
        if (extra && extra[key]) return Reflect.get(extra, key, receiver)
        return Reflect.get(target, key, receiver)
      },
    })
  }, [commander])
}
