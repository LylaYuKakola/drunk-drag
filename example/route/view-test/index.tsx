import * as React from 'react'
import DD, { DrunkDragType } from '../../../src'
import initCells from '../../config'
import './index.scss'

const { useState, useCallback, useMemo } = React
const { Viewer }:DrunkDragType = DD

// @ts-ignore
window['DD'] = DD

export default function () {

  const [pageWidth, setPageWidth] = useState(360)
  const [pageHeight, setPageHeight] = useState(640)
  const [cells, setCells] = useState(initCells)

  const handleChangeWidth = useCallback(event => {
    const newValue = Number(event.target.value)
    setPageWidth(newValue || pageWidth)
  }, [])

  const handleChangeHeight = useCallback(event => {
    const newValue = Number(event.target.value)
    setPageHeight(newValue || pageHeight)
  }, [])

  const handleChangeEditor = (newCells) => {
    setCells(newCells)
  }

  return (
    <div className="test">
      <div className="test-viewer">
      <Viewer
        id="001"
        cells={cells}
        width={pageWidth}
        height={pageHeight}
        style={{ backgroundColor: '#ff8080' }}
        isSingleScreen={false}
      />
    </div>
    </div>
  )
}
