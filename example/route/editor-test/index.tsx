import * as React from 'react'
import DD, { DrunkDragType } from '../../../src'
import initCells from '../../config'
import './index.scss'

const { useState, useCallback, useMemo } = React
const { Editor, Viewer }:DrunkDragType = DD

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

  const asyncCells = useCallback(() => {
    // return new Promise(resolve => {
    //   fetch()
    //     .then(res => res.json())
    //     .then(res => {
    //       resolve(res.data)
    //     })
    // })
    return initCells
  }, [])

  const handleChangeEditor = (newCells) => {
    // console.log(newCells)
  }

  return (
    <div className="test">
      <div className="test-editor">
        <Editor
          id="001"
          cells={asyncCells()}
          width={pageWidth}
          height={pageHeight}
          style={{ backgroundColor: '#ff8080' }}
          onChange={handleChangeEditor}
        />
      </div>
      <div
        className="test-form"
      >
        <label>宽度：</label><input value={pageWidth} onChange={handleChangeWidth} type="text"/><br/>
        <label>高度：</label><input value={pageHeight} onChange={handleChangeHeight} type="text"/><br/>
        <button>复制当前选中的元素</button><br/>
        <button>删除当前选中的元素</button><br/>
      </div>
      <div className="test-editor">
        <Editor
          id="002"
          cells={asyncCells()}
          width={pageWidth}
          height={pageHeight}
          style={{ backgroundColor: '#ff8080' }}
          onChange={handleChangeEditor}
        />
      </div>
    </div>
  )
}
