/**
 * @desc 指导拖拽，显示标线，为editor而服务
 */

import * as React from 'react'
import { GuideLineProps, ElementConfig, ViewportConfig } from '../typings'
import { MIN_DISTANCE, MAX_DISTANCE, MAX_NUMBER, ELEMENT, VIEWPORT } from '../util/constants'
import './index.scss'

const { useRef, useEffect, useMemo } = React

type ActiveCoordinateType = number[]
interface LineDataType {
  type: string,
  data: number[],
  size: number,
  position: number,
  tag: string,
}

// @TODO 这个函数不考虑入参设计，别乱用
const getGetGetLine =
  (activeData:number[]) =>
    (currentData:number[]) =>
      (c:number, a:number, isX:boolean, isViewport:boolean) => {
        const [aLeft, aTop, aRight, aBottom] = activeData
        const [cLeft, cTop, cRight, cBottom] = currentData
        if (isX) {
          const top = Math.min(cTop, aTop)
          const height = isViewport ? cBottom - cTop : cTop < aTop ? aBottom - cTop : cBottom - aTop
          return {
            type: 'y',
            data: [a, c],
            size: height,
            position: isViewport ? cTop : top,
            tag: isViewport ? VIEWPORT : ELEMENT,
          }
        }

        const left = Math.min(cLeft, aLeft)
        const width = isViewport ? cRight - cLeft : cLeft < aLeft ? aRight - cLeft : cRight - aLeft
        return {
          type: 'x',
          data: [a, c],
          size: width,
          position: isViewport ? cLeft : left,
          tag: isViewport ? VIEWPORT : ELEMENT,
        }
      }

const judgementGetter =
  (lineGetter:any) =>
    (cData:number[], a:number, direction:string, isViewport:boolean) => {
      let result:any[] = null
      const isX = ['L', 'R'].includes(direction)
      cData.forEach((c:number) => {
        if (Math.abs(c - a) < MIN_DISTANCE) {
          result = lineGetter(c, a, isX, isViewport)
        }
      })
      return result
    }

function doGuide(
  oldCoordinate: ActiveCoordinateType,
  coordinate: ActiveCoordinateType,
  allElements: ElementConfig[],
  allViewports: ViewportConfig[],
  selectedCells: ElementConfig[],
):any[] {

  if (!coordinate || !oldCoordinate || !allViewports || !selectedCells) return []
  if (coordinate[2] < coordinate[0] || coordinate[3] < coordinate[1]) return []
  if (oldCoordinate[2] < oldCoordinate[0] || oldCoordinate[3] < oldCoordinate[1]) return []

  const result = Array(2) // ax, cx, ay, cy
  const [aLeft, aTop, aRight, aBottom] = coordinate
  const [aCenterX, aCenterY] = [(aLeft + aRight) / 2, (aTop + aBottom) / 2]
  const [directionX, directionY] = [
    Number(coordinate[0] - oldCoordinate[0]) < 0 ? 'L' : 'R',
    Number(coordinate[1] - oldCoordinate[1]) < 0 ? 'T' : 'B',
  ]

  const getGetLine = getGetGetLine([aLeft, aTop, aRight, aBottom])
  let [distanceToCurrentX, distanceToCurrentY] = [MAX_DISTANCE, MAX_DISTANCE]

  const getCellHandler = (isViewport:boolean) => (cell:ElementConfig|ViewportConfig) => {
    if (selectedCells.includes(cell)) return
    const { x, y, w, h } = cell
    const [cLeft, cTop, cRight, cBottom, cCenterX, cCenterY] = [x, y, x + w, y + h, x + (w / 2), y + (h / 2)]
    const getLine = judgementGetter(getGetLine([cLeft, cTop, cRight, cBottom]))
    if (directionX === 'L') {
      let lineData:any[]
      lineData = getLine([cLeft, cCenterX, cRight], aRight, directionX, isViewport)
      lineData = getLine([cRight, cCenterX, cLeft], aLeft, directionX, isViewport) || lineData
      lineData = getLine([cRight, cLeft, cCenterX], aCenterX, directionX, isViewport) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrentY) {
          distanceToCurrentY = distance
          result[0] = lineData
        }
      }
    }
    if (directionX === 'R') {
      let lineData:any[]
      lineData = getLine([cRight, cCenterX, cLeft], aLeft, directionX, isViewport)
      lineData = getLine([cLeft, cCenterX, cRight], aRight, directionX, isViewport) || lineData
      lineData = getLine([cLeft, cRight, cCenterX], aCenterX, directionX, isViewport) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrentY) {
          distanceToCurrentY = distance
          result[0] = lineData
        }
      }
    }
    if (directionY === 'T') {
      let lineData:any[]
      lineData = getLine([cTop, cCenterY, cBottom], aBottom, directionY, isViewport)
      lineData = getLine([cBottom, cCenterY, cTop], aTop, directionY, isViewport) || lineData
      lineData = getLine([cBottom, cTop, cCenterY], aCenterY, directionY, isViewport) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrentX) {
          distanceToCurrentX = distance
          result[1] = lineData
        }
      }
    }
    if (directionY === 'B') {
      let lineData:any[]
      lineData = getLine([cBottom, cCenterY, cTop], aTop, directionY, isViewport)
      lineData = getLine([cTop, cCenterY, cBottom], aBottom, directionY, isViewport) || lineData
      lineData = getLine([cTop, cBottom, cCenterY], aCenterY, directionY, isViewport) || lineData
      if (lineData) {
        const [disL, disT] = [aLeft - cLeft, aTop - cTop]
        const distance = Math.sqrt((disL * disL) + (disT * disT))
        if (distance < distanceToCurrentX) {
          distanceToCurrentX = distance
          result[1] = lineData
        }
      }
    }
  }

  allElements.forEach(getCellHandler(false))
  allViewports.forEach(getCellHandler(true))

  return result
}

export default function ({
  cellsState, visible, dispatcher,
}: GuideLineProps) {

  const oldActiveCoordinate = useRef<ActiveCoordinateType>()

  const activeCoordinate = (() => {
    if (!cellsState.selectedElements || !cellsState.selectedElements.length) {
      return [0, 0, 0, 0]
    }
    let [minX, minY, maxX, maxY] = [MAX_NUMBER, MAX_NUMBER, 0 , 0]
    cellsState.selectedElements.forEach((cell:ElementConfig) => {
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
      cellsState.allElements || [],
      cellsState.allViewports || [],
      cellsState.selectedElements,
    )

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
          tag: ELEMENT,
          data: { move: moveData },
        },
      }])
      const [lineDataY, lineDataX] = linesData
      const lines:any[] = []
      if (lineDataY) {
        lines[0] = (
          <div
            style={{ height: lineDataY.size, top: lineDataY.position, left: lineDataY.data[1] }}
            className={`guideline-y-a${lineDataY.tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
        lines[1] = (
          <div
            style={{ height: lineDataY.size, top: lineDataY.position, left: lineDataY.data[1] }}
            className={`guideline-y-c${lineDataY.tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
      }
      if (lineDataX) {
        lines[2] = (
          <div
            style={{ width: lineDataX.size, left: lineDataX.position, top: lineDataX.data[1] }}
            className={`guideline-x-a${lineDataX.tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
        lines[3] = (
          <div
            style={{ width: lineDataX.size, left: lineDataX.position, top: lineDataX.data[1] }}
            className={`guideline-x-c${lineDataX.tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
      }
      return lines
    }

    const lines:any[] = []
    linesData.forEach((lineData: LineDataType) => {
      const { type, data, size, position, tag } = lineData
      if (type === 'y') {
        lines[0] = (
          <div
            style={{ height: size, top: position, left: data[0] }}
            className={`guideline-y-a${tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
        lines[1] = (
          <div
            style={{ height: size, top: position, left: data[1] }}
            className={`guideline-y-c${tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
      }
      if (type === 'x') {
        lines[2] = (
          <div
            style={{ width: size, left: position, top: data[0] }}
            className={`guideline-x-a${tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
        lines[3] = (
          <div
            style={{ width: size, left: position, top: data[1] }}
            className={`guideline-x-c${tag === VIEWPORT ?  '-v' : ''}`}
          />
        )
      }
    })
    return lines
  }, [activeCoordinate, cellsState.allElements, cellsState.allViewports, cellsState.selectedElements, visible])
}
