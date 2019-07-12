/**
 * @desc 提供视窗的的展示面板，给整个展示面板开一个小窗口，可以用来做ppt
 *
 * 小窗口同样是根据父元素进行充满适配
 * @TODO 请务必给父元素增加position的指定
 */

import * as React from 'react'
import { ViewportViewerPropsType } from '../../typings'
import useCells from '../../uses/useCells'
import useConstantState from '../../uses/useConstantState'
import { getViewerId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import useCommander from '../../commander'
import * as tj from '../../util/typeJudgement'

const { useState, useRef, useMemo, useLayoutEffect } = React

/**
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 面板内容
 * @param style 面板扩展样式
 * @param id 面板id
 * @param viewportHeight
 * @param viewportWidth
 * @param panelTop
 * @param panelLeft
 */
export default function viewportViewer(
  { cells, height, width, style, id, viewportHeight = -1, viewportWidth = -1, panelTop = 0, panelLeft = 0 }:ViewportViewerPropsType,
) {
  const viewportId = useConstantState(getViewerId(id)) // id设置为常量
  const [parentSize, setParentSize] = useState<{width:number, height:number}>({ width:0, height:0 })
  const [cellsState, dispatchCellsState] = useCellsReducer(cells)
  const cellDoms = useCells(cellsState, true)

  const [panelPosition, setPosition] = useState<[number, number]>([panelTop, panelLeft])

  const viewportRef = useRef<HTMLDivElement|null>(null)
  const viewportStyle = useMemo(() => {
    const realVH = (tj.isUsableNumber(viewportHeight)) || Number(viewportHeight) < 0 ? height : Number(viewportHeight)
    const realVW = (tj.isUsableNumber(viewportWidth)) || Number(viewportWidth) < 0 ? width : Number(viewportWidth)
    return {
      position: 'relative' as 'relative',
      height: realVH,
      width: realVW,
      overflow: 'hidden',
      transform: `scale(${parentSize.width / (realVW || parentSize.width)})`,
      transformOrigin: 'left top',
    }
  }, [viewportHeight, viewportWidth, width, height, parentSize.width])

  const panelStyle = useMemo(() => ({
    position: 'absolute',
    ...style,
    width,
    height,
    top: panelPosition[0],
    left: panelPosition[1],
  }), [style, width, height, panelPosition[0], panelPosition[1]])

  useCommander(`viewer-${viewportId}`, cellsState, dispatchCellsState, { setPosition })

  useLayoutEffect(() => {
    let purePageContainerDom = viewportRef.current.parentElement
    let [pw, ph] = [0, 0]
    if (!purePageContainerDom) {
      [pw, ph] = [width, height]
    } else {
      [pw, ph] = [purePageContainerDom.offsetWidth,   purePageContainerDom.offsetHeight]
    }
    setParentSize({
      width: pw,
      height: ph,
    })
    purePageContainerDom = null
  }, [viewportRef.current, cellsState, width, height])

  return (
    <div
      id={viewportId}
      key={viewportId}
      ref={viewportRef}
      className="viewer"
      style={viewportStyle}
    >
      <div
        style={panelStyle}
      >
        { cellDoms }
      </div>
    </div>
  )
}
