/**
 * @desc 面边中的元素组件
 */

import * as React from 'react'
import './index.scss'
import contents from '../../contents'
import { CellType } from '../../typings'

const { useMemo } = React

interface CellStyleType {
  top: number,
  left: number,
  width: number,
  height: number,
}

/**
 * 根据cell渲染内容
 * @param cell 元素配置
 */
export default function (cell:CellType) {
  const {
    w, h, x, y, type, style, isSelected, isViewer, id,
  } = cell

  const content = useMemo<any|null>(() => {
    const component = contents[type]
    return component({
      isViewer,
      ...cell,
    })
  }, [cell])

  const cellStyle = useMemo<CellStyleType>(() => ({
    top: y || 0,
    left: x || 0,
    width: w || 0,
    height: h || 0,
  }), [w, h, x, y])

  return useMemo(() => (
    <div
      style={cellStyle}
      className="cell"
      id={id}
      key={id}
    >
      {/* *********************************  content  ******************************* */}
      <div className="cell-content" style={...style}>{ content }</div>
      {/* *********************************  拖拽边框  ******************************* */}
      {
        (isSelected && !isViewer) && ([
          (
            <div
              data-tag={`l*${id}`}
              className="cell-left-line"
              style={{ height: (h + 4), top: -2, left: -4 }}
            />
          ), (
            <div
              data-tag={`r*${id}`}
              className="cell-right-line"
              style={{ height: (h + 4), top: -2, left: (w + 4) }}
            />
          ), (
            <div
              data-tag={`t*${id}`}
              className="cell-top-line"
              style={{ width: (w + 4), top: -4, left: -2 }}
            />
          ), (
            <div
              data-tag={`b*${id}`}
              className="cell-bottom-line"
              style={{ width: (w + 4), top: (h + 4), left: -2 }}
            />
          ), (
            <div
              data-tag={`tl*${id}`}
              className="cell-top-left-btn"
              style={{ top: -4, left: -4 }}
            />
          ),
          (
            <div
              data-tag={`tr*${id}`}
              className="cell-top-right-btn"
              style={{ top: -4, left: (w + 2) }}
            />
          ), (
            <div
              data-tag={`bl*${id}`}
              className="cell-bottom-left-btn"
              style={{ top: (h + 3), left: -4 }}
            />
          ), (
            <div
              data-tag={`br*${id}`}
              className="cell-bottom-right-btn"
              style={{ top: (h + 2), left: (w + 2) }}
            />
          ),
        ])
      }
    </div>
  ), [w, h, cellStyle, id, style, isSelected, isViewer, content])
}
