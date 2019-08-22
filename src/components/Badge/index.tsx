/**
   * @desc viewport组件的左上角的index
 */

import * as React from 'react'
import './index.scss'

const { useMemo } = React
export default ({ index }:{ index:number }) => {
  return useMemo(() => (
    <div className="badge">{index}</div>
  ), [index])
}
