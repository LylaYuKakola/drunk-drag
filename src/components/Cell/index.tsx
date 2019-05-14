import * as React from 'react'
import './index.scss'
import Elements from '../Elements'
import { guid } from '../../util/guid'
import { CellPropsType } from '../../typings'

const { useState, useMemo } = React

export default function ({
  w, h, x, y, type, style, contentProps, isSelected, isPurePage, index,
}:CellPropsType) {

  const [cellId] = useState(`cell-${guid()}`)

  const CurrentContent = useMemo(() => Elements[type], [type])

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
      id={cellId}
      key={cellId}
    >
      {/* *********************************  content  ******************************* */}
      <div className="cell-content" style={...style}>
        <CurrentContent
          isPurePage={isPurePage}
          {...contentProps}
        />
      </div>
      {/* *********************************  拖拽边框  ******************************* */}
      {
        (isSelected && !isPurePage) && ([
          (
            <div
              data-tag={`l*l*${index}`}
              className="cell-left-line"
              style={{ height: (h + 4), top: -2, left: -4 }}
            />
          ), (
            <div
              data-tag={`l*r*${index}`}
              className="cell-right-line"
              style={{ height: (h + 4), top: -2, left: (w + 4) }}
            />
          ), (
            <div
              data-tag={`l*t*${index}`}
              className="cell-top-line"
              style={{ width: (w + 4), top: -4, left: -2 }}
            />
          ), (
            <div
              data-tag={`l*b*${index}`}
              className="cell-bottom-line"
              style={{ width: (w + 4), top: (h + 4), left: -2 }}
            />
          ), (
            <div
              data-tag={`b*tl*${index}`}
              className="cell-top-left-btn"
              style={{ top: -4, left: -4 }}
            />
          ),
          (
            <div
              data-tag={`b*tr*${index}`}
              className="cell-top-right-btn"
              style={{ top: -4, left: (w + 2) }}
            />
          ), (
            <div
              data-tag={`b*bl*${index}`}
              className="cell-bottom-left-btn"
              style={{ top: (h + 3), left: -4 }}
            />
          ), (
            <div
              data-tag={`b*br*${index}`}
              className="cell-bottom-right-btn"
              style={{ top: (h + 2), left: (w + 2) }}
            />
          ),
        ])
      }
    </div>
  )
}
