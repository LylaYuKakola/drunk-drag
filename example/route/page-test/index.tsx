import * as React from 'react'
import DD from '../../../src'
import cells from '../../config'
import './index.scss'

const { useState, useCallback, useMemo } = React

// 引入组件
const { DDEditor, DDViewer } = DD

export default function () {

  const [pageWidth, setPageWidth] = useState(360)
  const [pageHeight, setPageHeight] = useState(640)

  const handleChangeWidth = useCallback(event => {
    const newValue = Number(event.target.value)
    setPageWidth(newValue || pageWidth)
  }, [])

  const handleChangeHeight = useCallback(event => {
    const newValue = Number(event.target.value)
    setPageHeight(newValue || pageHeight)
  }, [])

  return (
    <div className="page-test">
      <div className="page-test-editor" style={{ width: pageWidth, height: pageHeight }}>
        <DDEditor
          id="Page001"
          cells={cells}
          width={pageWidth}
          height={pageHeight}
        />
      </div>
      <div
        className="page-test-form"
      >
        <label>宽度：</label><input value={pageWidth} onChange={handleChangeWidth} type="text"/><br/>
        <label>高度：</label><input value={pageHeight} onChange={handleChangeHeight} type="text"/><br/>
        <button>复制当前选中的元素</button><br/>
        <button>删除当前选中的元素</button><br/>
      </div>
    </div>
  )
}
