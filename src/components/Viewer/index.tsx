/**
 * @desc 展示面板
 */

import * as React from 'react'
import { ViewerPropsType } from '../../typings'
import useCells from '../../uses/useCells'
import useConstantState from '../../uses/useConstantState'
import { getViewerId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import useCommander from '../../commander'
import useRound from './commands/useRound'

const { useState, useLayoutEffect, useRef, useMemo } = React

/**
 * 展示面板组件
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 面板内容
 * @param id 面板id
 * @param style 面板扩展样式
 */
export default function viewer({ cells, height, width, style, id }:ViewerPropsType) {
  const viewerId = useConstantState(getViewerId(id)) // id设置为常量
  const [parentSize, setParentSize] = useState<{width:number, height:number}>({ width:0, height:0 })
  const viewerRef = useRef<HTMLDivElement|null>(null)
  const [cellsState, dispatchCellsState] = useCellsReducer(cells)
  const cellDoms = useCells(cellsState, true)

  // extra commands
  const [isRounded, round] = useRound({
    parentSize,
    width,
    height,
    cellsState,
    dispatchCellsState,
  })

  const extra = useMemo(() => ({ round }), [round])
  useCommander(`viewer-${viewerId}`, cellsState, dispatchCellsState, extra)

  useLayoutEffect(() => {
    let purePageContainerDom = viewerRef.current.parentElement
    if (!purePageContainerDom) {
      setParentSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    } else {
      setParentSize({
        width: purePageContainerDom.offsetWidth,
        height: purePageContainerDom.offsetHeight,
      })
    }
    purePageContainerDom = null
  }, [viewerRef.current])

  return (
    <div
      id={viewerId}
      key={viewerId}
      ref={viewerRef}
      className="viewer"
      style={{
        ...style,
        width,
        height: isRounded ? (width / parentSize.width) * parentSize.height : height,
        overflowX: 'hidden',
        overflowY: isRounded ? 'hidden' : 'auto',
        transform: `scale(${parentSize.width / (width || 1)})`,
        position: 'relative',
        transformOrigin: 'left top',
      }}
    >
      { cellDoms }
    </div>
  )
}
