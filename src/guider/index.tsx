/**
 * @desc 指导拖拽，显示标线，为editor而服务
 */

import * as React from 'react'
import { GuideLinePropsType, CellType } from '../typings'
import { MIN_DISTANCE, MAX_NUMBER } from '../util/constVariables'
import './index.scss'

const { useRef, useEffect, useMemo } = React

type ActiveCoordinateType = number[]
interface LineDataType {
  type: string,
  data: number[],
  size: number,
  position: number,
}

// @TODO 这个函数不考虑入参设计，别乱用
const getGetGetLine = (activeData:number[]) => (currentData:number[]) => (c:number, a:number, isX:boolean) => {
  const [aLeft, aTop, aRight, aBottom] = activeData
  const [cLeft, cTop, cRight, cBottom] = currentData
  if (isX) {
    const top = Math.min(cTop, aTop)
    const height = cTop < aTop ? aBottom - cTop : cBottom - aTop
    return {
      type: 'y',
      data: [a, c],
      size: height,
      position: top,
    }
    // return [
    //   (<div style={{ height, top, left: a }} className="guideline-y-a" />),
    //   (<div style={{ height, top, left: c }} className="guideline-y-c" />),
    // ]
  }

  const left = Math.min(cLeft, aLeft)
  const width = cLeft < aLeft ? aRight - cLeft : cRight - aLeft
  return {
    type: 'x',
    data: [a, c],
    size: width,
    position: left,
  }
  // return [
  //   (<div style={{ width, left, top: a }} className="guideline-x-a" />),
  //   (<div style={{ width, left, top: c }} className="guideline-x-c" />),
  // ]
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
  let distanceToCurrent = MAX_NUMBER

  allCells.forEach((cell:CellType) => {
    if (selectedCells.includes(cell)) return
    const { x, y, w, h } = cell
    const [cLeft, cTop, cRight, cBottom, cCenterX, cCenterY] = [x, y, x + w, y + h, x + (w / 2), y + (h / 2)]
    const getLine = judgementGetter(getGetLine([cLeft, cTop, cRight, cBottom]))
    if (directionX === 'L') {
      let lineData:any[]
      lineData = getLine([cLeft, cCenterX, cRight], aRight, directionX)
      lineData = getLine([cRight, cCenterX, cLeft], aLeft, directionX) || lineData
      lineData = getLine([cRight, cLeft, cCenterX], aCenterX, directionX) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrent) {
          distanceToCurrent = distance
          result[0] = lineData
        }
      }
    }
    if (directionX === 'R') {
      let lineData:any[]
      lineData = getLine([cRight, cCenterX, cLeft], aLeft, directionX)
      lineData = getLine([cLeft, cCenterX, cRight], aRight, directionX) || lineData
      lineData = getLine([cLeft, cRight, cCenterX], aCenterX, directionX) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrent) {
          distanceToCurrent = distance
          result[0] = lineData
        }
      }
    }
    if (directionY === 'T') {
      let lineData:any[]
      lineData = getLine([cTop, cCenterY, cBottom], aBottom, directionY)
      lineData = getLine([cBottom, cCenterY, cTop], aTop, directionY) || lineData
      lineData = getLine([cBottom, cTop, cCenterY], aCenterY, directionY) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrent) {
          distanceToCurrent = distance
          result[1] = lineData
        }
      }
    }
    if (directionY === 'B') {
      let lineData:any[]
      lineData = getLine([cBottom, cCenterY, cTop], aTop, directionY)
      lineData = getLine([cTop, cCenterY, cBottom], aBottom, directionY) || lineData
      lineData = getLine([cTop, cBottom, cCenterY], aCenterY, directionY) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrent) {
          distanceToCurrent = distance
          result[1] = lineData
        }
      }
    }
  })

  return result
}

// @TODO 还没想好dispatcher怎么用
export default function ({
  allCells, selectedCells, editorH, editorW, visible, dispatcher,
}: GuideLinePropsType) {

  const oldActiveCoordinate = useRef<ActiveCoordinateType>()

  const activeCoordinate = (() => {
    if (!selectedCells || !selectedCells.length) {
      return [0, 0, 0, 0]
    }
    let [minX, minY, maxX, maxY] = [MAX_NUMBER, MAX_NUMBER, 0 , 0]
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

  return useMemo(() => {
    if (!visible) return []

    // 获取对比标线
    const linesData = doGuide(
      oldActiveCoordinate.current,
      activeCoordinate,
      allCells,
      selectedCells,
    )

    // 获取中心标线
    const [aLeft, aTop, aRight, aBottom] = activeCoordinate
    const [aCenterX, aCenterY] = [(aLeft + aRight) / 2, (aTop + aBottom) / 2]
    const [eCenterX, eCenterY] = [editorW / 2, editorH / 2]
    if (Math.abs(aCenterX - eCenterX) < MIN_DISTANCE) {
      linesData[0] = {
        type: 'y',
        data: [aCenterX, eCenterX],
        size: editorH,
        position: 0,
      }
    }
    if (Math.abs(aCenterY - eCenterY) < MIN_DISTANCE) {
      linesData[1] = {
        type: 'x',
        data: [aCenterY, eCenterY],
        size: editorW,
        position: 0,
      }
    }

    const moveData:number[] = [0, 0]
    if (activeCoordinate.length === 4 && oldActiveCoordinate.current && oldActiveCoordinate.current.length === 4) {
      const [directionX, directionY] = [
        Number(activeCoordinate[0] - oldActiveCoordinate.current[0]) < 0 ? 'L' : 'R',
        Number(activeCoordinate[1] - oldActiveCoordinate.current[1]) < 0 ? 'T' : 'B',
      ]
      if (linesData[0]) {
        const moveX = linesData[0].data[1] - linesData[0].data[0]
        if (directionX === 'L' && Math.abs(moveX) >= 1 && moveX < 2) moveData[0] = moveX
        if (directionX === 'R' && Math.abs(moveX) >= 1 && moveX > -2) moveData[0] = moveX
      }
      if (linesData[1]) {
        const moveY = linesData[1].data[1] - linesData[1].data[0]
        if (directionY === 'T' && Math.abs(moveY) >= 1 && moveY < 2) moveData[1] = moveY
        if (directionY === 'B' && Math.abs(moveY) >= 1 && moveY > -2) moveData[1] = moveY
      }
    }

    if (!!moveData[0] || !!moveData[1]) {
      dispatcher([{
        type: 'move',
        payload: {
          data: moveData,
        },
      }])
      const [lineDataY, lineDataX] = linesData
      const lines:any[] = []
      if (lineDataY) {
        lines[0] = (
          <div
            style={{ height: lineDataY.size, top: lineDataY.position, left: lineDataY.data[1] }}
            className="guideline-y-a"
          />
        )
        lines[1] = (
          <div
            style={{ height: lineDataY.size, top: lineDataY.position, left: lineDataY.data[1] }}
            className="guideline-y-c"
          />
        )
      }
      if (lineDataX) {
        lines[2] = (
          <div
            style={{ width: lineDataX.size, left: lineDataX.position, top: lineDataX.data[1] }}
            className="guideline-x-a"
          />
        )
        lines[3] = (
          <div
            style={{ width: lineDataX.size, left: lineDataX.position, top: lineDataX.data[1] }}
            className="guideline-x-c"
          />
        )
      }
      return lines
    }

    const lines:any[] = []
    linesData.forEach((lineData: LineDataType) => {
      const { type, data, size, position } = lineData
      if (type === 'y') {
        lines[0] = (<div style={{ height: size, top: position, left: data[0] }} className="guideline-y-a" />)
        lines[1] = (<div style={{ height: size, top: position, left: data[1] }} className="guideline-y-c" />)
      }
      if (type === 'x') {
        lines[2] = (<div style={{ width: size, left: position, top: data[0] }} className="guideline-x-a" />)
        lines[3] = (<div style={{ width: size, left: position, top: data[1] }} className="guideline-x-c" />)
      }
    })
    return lines
  }, [activeCoordinate, allCells, selectedCells, editorH, editorW, visible])
}
