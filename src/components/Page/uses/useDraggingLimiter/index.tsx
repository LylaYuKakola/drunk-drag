/**
 * @desc 编辑面板的拖拽操作限制器
 *
 * 拖拽改变大小，最大和最小的限制
 * 拖拽移动位置，面板边界的限制
 */

import * as React from 'react'
import { CellType } from '../../../../typings'
import { MIN_WIDTH_OF_CELL, MIN_HEIGHT_OF_CELL } from '../../../../util/constVariables'

const { useCallback } = React

export type LimitCellSizeType = (cell:CellType, data:number[], direction:string) => number[]
export type LimitCellPositionType = (active:number[], data:number[]) => number[]
/**
 * @param width 编辑面板宽度
 * @param height 编辑面板高度
 * @param cellsState cells的状态（allCells + selectedCells）
 * @return [limitCellSize, limitCellPosition] 限制cell的size和position的方法
 */
export default function useDraggingLimiter(
  width:number,
  height:number,
) {
  // resize的边界控制
  const limitCellSize:LimitCellSizeType = useCallback((cell, data, direction) => {
    const { x, y, w, h } = cell
    let [resizeX, resizeY] = data
    if (direction.includes('l')) {
      if ((x + resizeX) <= 0) resizeX = -x
      if ((w - resizeX) <= MIN_WIDTH_OF_CELL) resizeX = w - MIN_WIDTH_OF_CELL
    }
    if (direction.includes('r')) {
      if ((x + w + resizeX) >= width) resizeX = width - x - w
      if ((w + resizeX) <= MIN_WIDTH_OF_CELL) resizeX = MIN_WIDTH_OF_CELL - w
    }
    if (direction.includes('t')) {
      if ((y + resizeY) <= 0) resizeY = -y
      if ((h - resizeY) <= MIN_HEIGHT_OF_CELL) resizeY = h - MIN_HEIGHT_OF_CELL
    }
    if (direction.includes('b')) {
      if ((y + h + resizeY) >= height) resizeY = height - y - h
      if ((h + resizeY) <= MIN_HEIGHT_OF_CELL) resizeY = MIN_HEIGHT_OF_CELL - h
    }
    return [resizeX, resizeY]
  }, [width, height])

  // move的边界控制
  const limitCellPosition:LimitCellPositionType = useCallback((active, data) => {
    let [moveX, moveY] = data
    const [activeTop, activeBottom, activeLeft, activeRight] = active
    if ((activeTop + moveY) < 0) moveY = -activeTop
    if ((activeLeft + moveX) < 0) moveX = -activeLeft
    if ((activeBottom + moveY) > height) moveY = height - activeBottom
    if ((activeRight + moveX) > width) moveX = width - activeBottom
    return [moveX, moveY]
  }, [width, height])

  return { limitCellSize, limitCellPosition }
}
