/**
 * @desc 普通的展示面板，展示实际配置的宽高和内容
 */

import * as React from 'react'
import { ViewerProps, ViewportProps } from '../typings'
import useAllElements from '../uses/useAllElements'
import useAllViewports from '../uses/useAllViewports'
import useConstantState from '../uses/useConstantState'
import { getViewerId } from '../util/guid'
import useCellsReducer from '../dispatcher'
import useCommander from '../commander'

const { useRef, useMemo, useState, useLayoutEffect, useCallback } = React

/**
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 面板内容
 * @param style 面板扩展样式
 * @param id 面板id
 */
export default function viewer({
  elements,
  viewports,
  height,
  width,
  style,
  id,
  noScroll,
}:ViewerProps) {

  const viewerId = useConstantState(getViewerId(id)) // id设置为常量

  const panelRef = useRef<HTMLDivElement|null>(null)

  // [left, top]
  const [viewportIndex, setViewportIndex] = useState<number>(0)
  const [parentSize, setParentSize] = useState<[number, number]>([0, 0])

  //
  const goToNextViewport = useCallback(() => {
    setViewportIndex(i => i + 1)
  }, [setViewportIndex])

  // 展示的cell相关
  const [cellsState, dispatchCellsState] = useCellsReducer({ elements, viewports })
  const commander = useCommander(
    `viewer-${viewerId}`,
    cellsState,
    dispatchCellsState,
    { goToNextViewport },
  )
  const elementsDom = useAllElements(cellsState, true)
  const viewportsDom = useAllViewports(cellsState, true)

  // 面板样式
  const panelStyle = useMemo(() => {
    const viewports:ViewportProps[] = cellsState.allViewports
    const finalStyle = {
      ...style,
      width,
      height,
      left: 0,
      top: 0,
      position: 'absolute',
      transformOrigin: '0 0',
      transform: 'scale(1)',
    }

    if (
      !viewports ||
      !viewports.length ||
      viewportIndex < 0
    ) {
      finalStyle.display = 'none'
      return finalStyle
    }

    let viewport = (viewports || [])[viewportIndex]
    if (viewportIndex >= viewports.length) {
      viewport = viewports[viewports.length - 1]
    }

    const { x, y, w, h } = viewport
    const [pw, ph] = parentSize
    const scale = +pw / +w
    const scaledH = h * scale
    const scaledX = x * scale
    const scaledY = y * scale

    const left = scaledX
    let top = scaledY
    if (scaledH < ph) {
      top += (ph - scaledH) / 2
    }

    finalStyle.left = -left
    finalStyle.top = -top
    finalStyle.transform = `scale(${scale})`
    return finalStyle
  }, [
    style,
    viewportIndex,
    width,
    height,
    parentSize[0],
    parentSize[1],
    cellsState.allViewports,
  ])

  // 获取parentSize相关布局数据
  useLayoutEffect(() => {
    let purePageContainerDom = panelRef.current.parentElement
    if (!purePageContainerDom) {
      setParentSize([width, height])
    } else {
      setParentSize([purePageContainerDom.offsetWidth, purePageContainerDom.offsetHeight])
    }
    purePageContainerDom = null
  }, [panelRef.current, width, height])

  return (
    <div
      id={viewerId}
      key={viewerId}
      ref={panelRef}
      className="viewer"
      style={panelStyle}
    >
      { elementsDom}
      { viewportsDom }
    </div>
  )
}
