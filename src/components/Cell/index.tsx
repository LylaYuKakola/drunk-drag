/**
 * @desc 面边中的元素组件
 */

import * as React from 'react'
import './index.scss'
import { CellProps } from '../../typings'

const { useMemo } = React

interface CellRectStyle {
  top: number,
  left: number,
  width: number,
  height: number,
}

/**
 * 根据cell渲染内容
 * @param cell 元素配置
 */
export default ({
  w,
  h,
  x,
  y,
  id,
  content,
  borderVisible,
  zIndex,
  style,
  containerExtraStyle,
}: CellProps) => {

  // cell的矩形布局样式
  const cellRectStyle = useMemo<CellRectStyle>(() => ({
    ...(containerExtraStyle || {}),
    zIndex,
    top: y || 0,
    left: x || 0,
    width: w || 0,
    height: h || 0,
  }), [w, h, x, y, containerExtraStyle, zIndex])

  return useMemo(() => (
    <div
      style={cellRectStyle}
      className="cell"
      key={`cell-${id}`}
      id={`cell-${id}`}
    >
      {/* *********************************  content  ******************************* */}
      <div className="cell-content" style={...style}>{ content }</div>
      {/* *********************************  拖拽边框  ******************************* */}
      {
        borderVisible && ([
          (
            <div
              data-tag={`l*${id}`}
              className="cell-left-line"
              style={{ height: (h + 2), top: -1, left: -2 }}
            />
          ), (
            <div
              data-tag={`r*${id}`}
              className="cell-right-line"
              style={{ height: (h + 2), top: -1, left: (w + 1) }}
            />
          ), (
            <div
              data-tag={`t*${id}`}
              className="cell-top-line"
              style={{ width: (w + 2), top: -2, left: -1 }}
            />
          ), (
            <div
              data-tag={`b*${id}`}
              className="cell-bottom-line"
              style={{ width: (w + 2), top: (h + 1), left: -1 }}
            />
          ), (
            <div
              data-tag={`tl*${id}`}
              className="cell-top-left-btn"
              style={{ top: -2, left: -2 }}
            />
          ),
          (
            <div
              data-tag={`tr*${id}`}
              className="cell-top-right-btn"
              style={{ top: -2, left: (w - 1) }}
            />
          ), (
            <div
              data-tag={`bl*${id}`}
              className="cell-bottom-left-btn"
              style={{ top: (h - 1), left: -2 }}
            />
          ), (
            <div
              data-tag={`br*${id}`}
              className="cell-bottom-right-btn"
              style={{ top: (h - 1), left: (w - 1) }}
            />
          ),
        ])
      }
    </div>
  ), [w, h, cellRectStyle, id, style, content, borderVisible])
}
