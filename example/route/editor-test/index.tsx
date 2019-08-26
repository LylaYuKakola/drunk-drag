import * as React from 'react'
import DD from '../../../src'
import config from '../../config'
import './index.scss'

const { useState, useCallback } = React
const { Editor } = DD

export default function () {

  const [pageWidth, setPageWidth] = useState(1000)
  const [pageHeight, setPageHeight] = useState(800)

  const handleChangeWidth = useCallback((event) => {
    const newValue = Number(event.target.value)
    setPageWidth(newValue || pageWidth)
  }, [])

  const handleChangeHeight = useCallback((event) => {
    const newValue = Number(event.target.value)
    setPageHeight(newValue || pageHeight)
  }, [])

  return (
    <div className="test">
      <div className="test-editor">
        <Editor
          {...config}
          id="001"
          style={{ backgroundColor: '#f3f1ef' }}
        />
      </div>
    </div>
  )
}
