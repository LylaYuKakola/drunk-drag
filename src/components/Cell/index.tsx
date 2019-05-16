import * as React from 'react'
import './index.scss'
import Elements from '../Elements'
import { CellPropsType } from '../../typings'

const { useMemo } = React

export default function ({
  w, h, x, y, type, style, contentProps, isSelected, isPurePage, id,
}:CellPropsType) {

  const content = useMemo(() => {
    const component = Elements[type]
    return component({
      isPurePage,
      ...contentProps,
    })
  }, [type, contentProps, isPurePage])

  const cellStyle = useMemo(() => ({
    top: y,
    left: x,
    width: w,
    height: h,
  }), [w, h, x, y])

  return (
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
        (isSelected && !isPurePage) && ([
          (
            <div
              data-tag={`l*l*${id}`}
              className="cell-left-line"
              style={{ height: (h + 4), top: -2, left: -4 }}
            />
          ), (
            <div
              data-tag={`l*r*${id}`}
              className="cell-right-line"
              style={{ height: (h + 4), top: -2, left: (w + 4) }}
            />
          ), (
            <div
              data-tag={`l*t*${id}`}
              className="cell-top-line"
              style={{ width: (w + 4), top: -4, left: -2 }}
            />
          ), (
            <div
              data-tag={`l*b*${id}`}
              className="cell-bottom-line"
              style={{ width: (w + 4), top: (h + 4), left: -2 }}
            />
          ), (
            <div
              data-tag={`b*tl*${id}`}
              className="cell-top-left-btn"
              style={{ top: -4, left: -4 }}
            />
          ),
          (
            <div
              data-tag={`b*tr*${id}`}
              className="cell-top-right-btn"
              style={{ top: -4, left: (w + 2) }}
            />
          ), (
            <div
              data-tag={`b*bl*${id}`}
              className="cell-bottom-left-btn"
              style={{ top: (h + 3), left: -4 }}
            />
          ), (
            <div
              data-tag={`b*br*${id}`}
              className="cell-bottom-right-btn"
              style={{ top: (h + 2), left: (w + 2) }}
            />
          ),
        ])
      }
    </div>
  )
}
