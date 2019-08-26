/**
 * @desc 提供editor、viewer和指令的挂接函数，同时规定部分editor和viewer组件实例的基本指令
 *
 * **以下提到的组件指的是editor和viewer的实例**
 *
 * 通过导出的connect方法和组件实例进行连接，开放给使用者一些操作组件内容的方法
 * 包括以下：
 * - 获取组件内的单个或多个cell的状态
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

import { ReducerAction, CellsState, ElementAndViewportProps, PlainObject } from '../typings'
import deepCopy from '../util/deepCopy'
import * as tj from '../util/typeJudgement'
import getKeysInStateByTagName from '../util/getKeysInStateByTagName'
import { ELEMENT, VIEWPORT } from '../util/constants'

type DispatchType = (actions: ReducerAction[]) => void
type CellGetterType = (tag:string, ids: string[]) => any
type CellFnType = (tag:string, id:string) => ElementAndViewportProps
type CellsFnType = (tag:string, ids?:string[]) => ElementAndViewportProps[]
type ResizeType = (tag:string, id:string, data:[number, number, number, number]) => void
type MoveType = (tag:string, id:string, data:[number, number]) => void
type AddType = (tag:string, cell:ElementAndViewportProps) => void
type DeleteType = (tag:string, ids?:string[]) => void
type CleanType = () => void

export interface CommandsType {
  cell: CellFnType,
  cells: CellsFnType,
  resize: ResizeType,
  move: MoveType,
  add: AddType,
  delete: DeleteType,
  clean: CleanType,
  [key:string]: any,
}

const { useMemo, useCallback, useEffect, useRef } = React

// extra过滤掉不是不是函数的属性
const extraCommanderFilter = (extra:PlainObject = {}) => {
  const result:PlainObject = {}
  const keys = Object.keys(extra)
  if (!keys.length) return result
  keys.forEach((key:string) => {
    if (tj.isFunction(extra[key])) result[key] = extra[key]
  })
  return result
}

export const commanders = new Map()

/**
 * 指令方法
 * @param componentId
 * @param cellsState
 * @param dispatch
 * @param extra
 */
export default function useCommander(componentId:string, cellsState:CellsState, dispatch:DispatchType, extra?:any) {

  const cellsStateRef = useRef<CellsState>(cellsState)

  const getCells = useCallback<CellGetterType>((tag, ids) => {
    const cellsState = cellsStateRef.current
    const { key } = getKeysInStateByTagName(tag)
    const cells = Reflect.get(cellsState, key)
    if (!cells || !cells.length) return []
    if (!ids) return deepCopy(cells)
    return deepCopy(
      cells.filter((cell:ElementAndViewportProps) => ids.includes(cell.id)),
    )
  }, [])

  const commander = useMemo(() => {
    return Object.freeze({
      ...extraCommanderFilter(extra),
      element(id:string) {
        return getCells(ELEMENT, [id])[0] || null
      },
      elements(tag:string, ids:string[]) {
        return getCells(ELEMENT, ids)
      },
      viewport(id:string) {
        return getCells(VIEWPORT, [id])[0] || null
      },
      viewports(tag:string, ids:string[]) {
        return getCells(VIEWPORT, ids)
      },
      resize(tag:string, id:string, data:number[]) {
        const [top, right, bottom, left] = data
        dispatch([{
          type: 'select',
          payload: {
            tag,
            ids: [id],
          },
        }, {
          type: 'resize',
          payload: {
            tag,
            data: {
              direction: 'lt',
              resize: [-top, -left],
            },
          },
        }, {
          type: 'resize',
          payload: {
            tag,
            data: {
              direction: 'rb',
              resize: [right, bottom],
            },
          },
        }])
      },
      move(tag:string, id:string, data:number[]) {
        const [moveX, moveY] = data
        dispatch([{
          type: 'select',
          payload: {
            tag,
            ids: [id],
          },
        }, {
          type: 'move',
          payload: {
            tag,
            data: {
              move: [moveX, moveY],
              direction: 'lt',
            },
          },
        }])
      },
      add(tag:string, cells:ElementAndViewportProps[]) {
        dispatch([{
          type: 'add',
          payload: {
            tag,
            data: { cells },
          },
        }])
      },
      delete(tag:string, ids:string[]) {
        dispatch([{
          type: 'select',
          payload: {
            tag,
            ids: ids ? ids : [],
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
    })
  }, [dispatch, getCells, extra])

  useEffect(() => {
    cellsStateRef.current = cellsState
  }, [cellsState])

  useEffect(() => {
    commanders.set(componentId, commander)
    return () => {
      commanders.delete(componentId)
    }
  }, [componentId, commander])

  return commander
}
