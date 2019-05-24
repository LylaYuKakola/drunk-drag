/**
 * @desc 没什么可说的
 */

import * as React from 'react'
import { ReducerActionType, CellType } from '../typings'

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

/**
 * 指令方法
 * @param dispatch 执行cell相关操作的方法
 * @param cellGetter cell的获取方法
 */
export default function commander(dispatch:DispatchType, cellGetter:CellGetterType):CommandsType {
  return Object.freeze({
    cell(id) {
      return cellGetter(id ? [id] : [])
    },
    cells(ids) {
      return cellGetter(ids ? ids : ['__A_L_L__'])
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
      const cell = cellGetter(id ? [id] : [])
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
      const cell = cellGetter(id ? [id] : [])
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
  })
}
