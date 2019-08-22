/**
 * @desc 面边中的元素组件
 */

import * as React from 'react'
import { ViewportProps } from '../../typings'
import Cell from '../Cell'
import Badge from '../Badge'

const { useMemo } = React

export default ({
  w,
  h,
  x,
  y,
  shape,
  id,
  style,
  className,
  index,
  isSelected,
  isViewer,
}:ViewportProps) => {
  const content = useMemo<any|null>(() => {
    if (isViewer) return null
    return (<Badge index={index + 1} />)
  }, [isViewer, index])

  const containerExtraStyle = useMemo(() => {
    if (isViewer) return {}
    return { boxShadow: '0 0 5px rgb(80, 80, 50) inset' }
  }, [isViewer])

  return useMemo(() => (
    <Cell
      x={x}
      y={y}
      h={h}
      w={w}
      id={id}
      content={content}
      zIndex={0}
      style={style}
      borderVisible={isSelected && !isViewer}
      containerExtraStyle={containerExtraStyle}
    />
  ), [w, h, x, y, id, style, isSelected, isViewer, content, containerExtraStyle])
}
