/**
 * @desc 标线内容
 * 1.
 */

import * as React from 'react'
import { GuideLinePropsType, CellType } from '../../../../typings'
import { MIN_DISTANCE } from '../../../../util/constVariables'
import './index.scss'

// Y轴的标线
function getYGuidelines(
  x:number,
  w:number,
  xToGuide:number,
  withoutPageCenter:boolean,
  pageW:number,
) {
  let isXToGuideNeeded = false
  const centerX = x + (w / 2)
  const pageCenterX = (pageW || 0) / 2
  const resultLines:any[] = []

  // xToGuide vs x
  if (Math.abs(xToGuide - x) < MIN_DISTANCE) {
    isXToGuideNeeded = true
    resultLines.push(<div style={{ left: x }} className="guideline-y" />)
  }
  // xToGuide vs (x + w)
  if (Math.abs(xToGuide - (x + w)) < MIN_DISTANCE) {
    isXToGuideNeeded = true
    resultLines.push(<div style={{ left: (x + w) }} className="guideline-y" />)
  }
  // xToGuide vs centerX
  if (Math.abs(xToGuide - centerX) < MIN_DISTANCE) {
    isXToGuideNeeded = true
    resultLines.push(<div style={{ left: centerX }} className="guideline-y" />)
  }
  // xToGuide vs pageCenterX
  if (Math.abs(xToGuide - pageCenterX) < MIN_DISTANCE && !withoutPageCenter) {
    isXToGuideNeeded = true
    resultLines.push(<div style={{ left: pageCenterX }} className="guideline-y" />)
  }
  // isXToGuideNeeded
  if (isXToGuideNeeded) {
    resultLines.push(<div style={{ left: xToGuide }} className="guideline-y" />)
  }

  return resultLines
}

function getXGuidelines(
  y:number,
  h:number,
  yToGuide:number,
  withoutPageCenter:boolean,
  pageH:number,
) {
  let isYToGuideNeeded = false
  const centerY = y + (h / 2)
  const pageCenterY = (pageH || 0) / 2
  const resultLines:any[] = []

  // yToGuide vs y
  if (Math.abs(yToGuide - y) < MIN_DISTANCE) {
    isYToGuideNeeded = true
    resultLines.push(<div style={{ top: y }} className="guideline-x" />)
  }
  // yToGuide vs (y + h)
  if (Math.abs(yToGuide - (y + h)) < MIN_DISTANCE) {
    isYToGuideNeeded = true
    resultLines.push(<div style={{ top: (y + h) }} className="guideline-x" />)
  }
  // yToGuide vs centerY
  if (Math.abs(yToGuide - centerY) < MIN_DISTANCE) {
    isYToGuideNeeded = true
    resultLines.push(<div style={{ top: centerY }} className="guideline-x" />)
  }
  // yToGuide vs pageCenterY
  if (Math.abs(yToGuide - pageCenterY) < MIN_DISTANCE && !withoutPageCenter) {
    isYToGuideNeeded = true
    resultLines.push(<div style={{ top: pageCenterY }} className="guideline-x" />)
  }
  // isXToGuideNeeded
  if (isYToGuideNeeded) {
    resultLines.push(<div style={{ top: yToGuide }} className="guideline-x" />)
  }

  return resultLines
}

// 渲染辅助线
function getAllGuideline(
  activeX:number,
  activeY:number,
  activeW:number,
  activeH:number,
  pageW:number,
  pageH:number,
  cells:CellType[],
  selectedCells: CellType[],
  visible:boolean,
):any[] {
  /**
   * activeX, activeY, activeW, activeH 对应上下左右以及中心点x、y轴6条线
   * 每个cell的 x, y, w, h 对应上下左右以及中心点x、y轴6条线
   * 这里需要判断这12条线是否需要显示，需要分情况
   * cell对应的横着的三根线，和active横着的三根线去对比，3*3为9个判断
   * cell对应的竖着的三根线，和active竖着的三根线去对比，3*3为9个判断
   * 一共18个...
   */
  if (!cells.length || !visible) return []

  const activeCenterX = activeX + (activeW / 2)
  const activeCenterY = activeY + (activeH / 2)

  const result: any[] = []

  if (activeW === 0 && activeH === 0) return result

  cells.forEach((cell:CellType) => {
    const { x, y, w, h } = cell

    if (selectedCells.includes(cell)) return

    // activeX 对应的y轴辅助线和其他y轴辅助线做对比
    result.push(...getYGuidelines(x, w, activeX, false, pageW))
    // activeCenterX 对应的y轴辅助线和其他y轴辅助线做对比
    result.push(...getYGuidelines(x, w, activeCenterX, false, pageW))
    // activeX+activeW 对应的y轴辅助线和其他y轴辅助线做对比
    result.push(...getYGuidelines(x, w, (activeX + activeW), false, pageW))

    // activeY 对应的y轴辅助线和其他y轴辅助线做对比
    result.push(...getXGuidelines(y, h, activeY, false, pageH))
    // activeCenterX 对应的y轴辅助线和其他y轴辅助线做对比
    result.push(...getXGuidelines(y, h, activeCenterY, false, pageH))
    // activeX对应的y轴辅助线和其他y轴辅助线做对比
    result.push(...getXGuidelines(y, h, (activeY + activeH), false, pageH))
  })

  // 这里需要判断如果此时guideline还为空，可能是因为页面上所有的cell都为selected状态，此时只需要和page的center辅助线进行匹配
  // @TODO 这样处理不是很好，但是我也不想改了
  if (!result.length) {
    result.push(...getYGuidelines(activeX, activeW, pageW / 2, true, pageW))
    result.push(...getXGuidelines(activeY, activeH, pageH / 2, true, pageH))
  }

  return result
}

export default function ({
  allCells, selectedCells, pageH, pageW, visible,
}: GuideLinePropsType) {

  const [
    activeX,
    activeY,
    activeW,
    activeH,
  ] = (() => {
    if (!selectedCells || !selectedCells.length) {
      return [0, 0, 0, 0]
    }

    let minX = 999999999
    let minY = 999999999
    let maxX = 0
    let maxY = 0
    selectedCells.forEach((cell:CellType) => {
      if (cell.x < minX) minX = cell.x
      if (cell.y < minY) minY = cell.y
      if ((cell.x + cell.w) > maxX) maxX = cell.x + cell.w
      if ((cell.y + cell.h) > maxY) maxY = cell.y + cell.h
    })
    return [minX, minY, maxX - minX, maxY - minY]
  })()

  return getAllGuideline(
    activeX,
    activeY,
    activeW,
    activeH,
    pageW,
    pageH,
    allCells,
    selectedCells,
    visible,
  )
}
