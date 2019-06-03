/**
 * @desc 指导拖拽，显示标线
 */

import * as React from 'react'
import { GuideLinePropsType, CellType } from '../typings'
import { MIN_DISTANCE } from '../util/constVariables'
import './index.scss'

const { useRef, useEffect } = React

type ActiveCoordinateType = number[]

// @TODO 这个函数不考虑入参设计，别乱用
const getGetGetLine = (activeData:number[]) => (currentData:number[]) => (c:number, a:number, isX:boolean) => {
  const [aLeft, aTop, aRight, aBottom] = activeData
  const [cLeft, cTop, cRight, cBottom] = currentData
  if (isX) {
    const top = Math.min(cTop, aTop)
    const height = cTop < aTop ? aBottom - cTop : cBottom - aTop
    return [
      (<div style={{ height, top, left: a }} className="guideline-y-a" />),
      (<div style={{ height, top, left: c }} className="guideline-y-c" />),
    ]
  }

  const left = Math.min(cLeft, aLeft)
  const width = cLeft < aLeft ? aRight - cLeft : cRight - aLeft
  return [
    (<div style={{ width, left, top: a }} className="guideline-x-a" />),
    (<div style={{ width, left, top: c }} className="guideline-x-c" />),
  ]
}
const judgementGetter = (lineGetter:any) => (cData:number[], a:number, direction:string) => {
  let result:any[] = null
  const isX = ['L', 'R'].includes(direction)
  cData.forEach((c:number) => {
    if (Math.abs(c - a) < MIN_DISTANCE) {
      result = lineGetter(c, a, isX)
    }
  })
  return result
}

function doGuide(
  oldCoordinate: ActiveCoordinateType,
  coordinate: ActiveCoordinateType,
  allCells: CellType[],
  selectedCells: CellType[],
):any[] {

  if (!coordinate || !oldCoordinate || !allCells) return []
  if (coordinate[2] < coordinate[0] || coordinate[3] < coordinate[1]) return []
  if (oldCoordinate[2] < oldCoordinate[0] || oldCoordinate[3] < oldCoordinate[1]) return []

  const result = Array(4) // ax, cx, ay, cy
  const [aLeft, aTop, aRight, aBottom] = coordinate
  const [aCenterX, aCenterY] = [(aLeft + aRight) / 2, (aTop + aBottom) / 2]
  const [directionX, directionY] = [
    Number(coordinate[0] - oldCoordinate[0]) < 0 ? 'L' : 'R',
    Number(coordinate[1] - oldCoordinate[1]) < 0 ? 'T' : 'B',
  ]

  const getGetLine = getGetGetLine([aLeft, aTop, aRight, aBottom])

  allCells.forEach((cell:CellType) => {
    if (selectedCells.includes(cell)) return
    const { x, y, w, h } = cell
    const [cLeft, cTop, cRight, cBottom, cCenterX, cCenterY] = [x, y, x + w, y + h, x + (w / 2), y + (h / 2)]
    const getLine = judgementGetter(getGetLine([cLeft, cTop, cRight, cBottom]))
    if (directionX === 'L') {
      let lines:any[]
      lines = getLine([cLeft, cCenterX, cRight], aRight, directionX)
      lines =  getLine([cRight, cCenterX, cLeft], aLeft, directionX) || lines
      lines =  getLine([cRight, cLeft, cCenterX], aCenterX, directionX) || lines
      if (lines) [result[0], result[1]] = lines
    }
    if (directionX === 'R') {
      let lines:any[]
      lines = getLine([cRight, cCenterX, cLeft], aLeft, directionX)
      lines = getLine([cLeft, cCenterX, cRight], aRight, directionX) || lines
      lines = getLine([cLeft, cRight, cCenterX], aCenterX, directionX) || lines
      if (lines) [result[0], result[1]] = lines
    }
    if (directionY === 'T') {
      let lines:any[]
      lines = getLine([cTop, cCenterY, cBottom], aBottom, directionY)
      lines = getLine([cBottom, cCenterY, cTop], aTop, directionY) || lines
      lines = getLine([cBottom, cTop, cCenterY], aCenterY, directionY) || lines
      if (lines) [result[2], result[3]] = lines
    }
    if (directionY === 'B') {
      let lines:any[]
      lines = getLine([cBottom, cCenterY, cTop], aTop, directionY)
      lines = getLine([cTop, cCenterY, cBottom], aBottom, directionY) || lines
      lines = getLine([cTop, cBottom, cCenterY], aCenterY, directionY) || lines
      if (lines) [result[2], result[3]] = lines
    }
  })

  return result
}

export default function ({
  allCells, selectedCells, editorH, editorW, visible, dispatcher,
}: GuideLinePropsType) {

  const oldActiveCoordinate = useRef<ActiveCoordinateType>()

  const activeCoordinate = (() => {
    if (!selectedCells || !selectedCells.length) {
      return [0, 0, 0, 0]
    }
    let [minX, minY, maxX, maxY] = [999999999, 999999999, 0 , 0]
    selectedCells.forEach((cell:CellType) => {
      if (cell.x < minX) minX = cell.x
      if (cell.y < minY) minY = cell.y
      if ((cell.x + cell.w) > maxX) maxX = cell.x + cell.w
      if ((cell.y + cell.h) > maxY) maxY = cell.y + cell.h
    })
    return [minX, minY, maxX, maxY]
  })()

  useEffect(() => {
    return () => {
      oldActiveCoordinate.current = activeCoordinate
    }
  }, [...activeCoordinate])

  const lines = doGuide(oldActiveCoordinate.current, activeCoordinate, allCells, selectedCells)

  return visible ? lines : []
}
