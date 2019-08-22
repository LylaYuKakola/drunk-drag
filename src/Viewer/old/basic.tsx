/**
 * @desc 普通的展示面板，展示实际配置的宽高和内容
 */

import * as React from 'react'
import { BasicViewerPropsType } from '../../typings'
import useCells from '../../_commonParts/Cells'
import useConstantState from '../../uses/useConstantState'
import { getViewerId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import useCommander from '../../commander'

const { useRef, useMemo } = React

/**
 * @param width 面板宽度
 * @param height 面板高度
 * @param cells 面板内容
 * @param style 面板扩展样式
 * @param id 面板id
 */
export default function viewer({ cells, height, width, style, id }:BasicViewerPropsType) {
  const viewerId = useConstantState(getViewerId(id)) // id设置为常量
  const viewerRef = useRef<HTMLDivElement|null>(null)
  const [cellsState, dispatchCellsState] = useCellsReducer(cells)
  const cellDoms = useCells(cellsState, true)
  const viewerStyle = useMemo(() => ({
    position: 'relative',
    ...style,
    width,
    height,
  }), [style, width, height])

  useCommander(`viewer-${viewerId}`, cellsState, dispatchCellsState)

  return (
    <div
      id={viewerId}
      key={viewerId}
      ref={viewerRef}
      className="viewer"
      style={viewerStyle}
    >
      { cellDoms }
    </div>
  )
}
