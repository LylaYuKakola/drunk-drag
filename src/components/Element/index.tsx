/**
 * @desc 面边中的元素组件
 */

import * as React from 'react'
import { ElementProps } from '../../typings'
import contents from '../../contents'
import Cell from '../Cell'

const { useMemo } = React

export default ({
  w,
  h,
  x,
  y,
  type,
  id,
  actions,
  style,
  className,
  index,
  isSelected,
  isViewer,
}:ElementProps) => {

  const content = useMemo<any|null>(() => {
    // element
    const component = contents[type]
    return component({
      w, h, x, y, id, type, style, className,
      index, isSelected, isViewer,
    })
  }, [
    w, h, x, y, id, type, style, className,
    index, isSelected, isViewer,
  ])

  return useMemo(() => (
    <Cell
      x={x}
      y={y}
      h={h}
      w={w}
      id={id}
      content={content}
      zIndex={1}
      style={style}
      borderVisible={isSelected && !isViewer}
    />
  ), [w, h, x, y, id, style, isSelected, isViewer, content])
}
