/**
 * @desc 展示面板
 */

import * as React from 'react'
import { ViewerPropsType, MountedFunctionType } from '../../typings'
import useCells from '../../uses/useCells'
import { getViewerId } from '../../util/guid'
import useCellsReducer from '../../dispatcher'
import * as tj from '../../util/typeJudgement'
import useCommander from '../../commander'
import useRound from './commands/useRound'

const { useState, useLayoutEffect, useRef, useEffect } = React

export default function (onMounted?:MountedFunctionType) {

  /**
   * 展示面板组件
   * @param width 面板宽度
   * @param height 面板高度
   * @param cells 面板内容
   * @param id 面板id
   * @param style 面板扩展样式
   */
  return function viewer({ cells, height, width, style, id }:ViewerPropsType) {
    const [viewerId] = useState(getViewerId(id)) // id设置为常量
    const [parentSize, setParentSize] = useState<{width:number, height:number}>({ width:0, height:0 })
    const viewerRef = useRef<HTMLDivElement|null>(null)
    const [cellsState, dispatchCellsState] = useCellsReducer(cells)
    const connectWithCommander = useCommander(cellsState, dispatchCellsState)
    const cellDoms = useCells(cellsState, true)

    // extra commands
    const [isRounded, round] = useRound({
      parentSize,
      width,
      height,
      cellsState,
      dispatchCellsState,
    })

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

    useEffect(() => {
      return () => {
        if (onMounted && tj.isFunction(onMounted)) onMounted(viewerId)
      }
    }, [])

    return connectWithCommander(
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
      </div>,
      { round },
    )
  }
}
