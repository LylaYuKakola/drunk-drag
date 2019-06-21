import * as React from 'react'
import $D from '../../../src'
import initCells from '../../config'
import './index.scss'

const { useState, useCallback, useRef, useEffect } = React
const { Viewer } = $D

export default function () {

  const [pageWidth, setPageWidth] = useState(800)
  const [pageHeight, setPageHeight] = useState(600)
  const [cells, setCells] = useState(initCells)
  const viewer = useRef(null)
  const arrow = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
  })

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

  const handleKeyDown = useCallback(event => {
    viewer.current = $D('viewer', '001')
    let [x, y] = [0, 0]
    if (event.key === 'ArrowUp') arrow.current.up = true
    if (event.key === 'ArrowDown') arrow.current.down = true
    if (event.key === 'ArrowLeft') arrow.current.left = true
    if (event.key === 'ArrowRight') arrow.current.right = true
    if (arrow.current.left) x = -1
    if (arrow.current.right) x = 1
    if (arrow.current.up) y = -1
    if (arrow.current.down) y = 1
    viewer.current.move('cell2', [x, y])
  }, [])

  const handleKeyUp = useCallback(event => {
    if (event.key === 'ArrowUp') arrow.current.up = false
    if (event.key === 'ArrowDown') arrow.current.down = false
    if (event.key === 'ArrowLeft') arrow.current.left = false
    if (event.key === 'ArrowRight') arrow.current.right = false
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const asyncCells = useCallback(() => {
    return initCells
  }, [])

  return (
    <div className="test">
      <div className="test-viewer">
        <Viewer
          id="001"
          cells={asyncCells()}
          width={pageWidth}
          height={pageHeight}
          style={{ backgroundColor: '#ff8080' }}
          isSingleScreen={true}
        />
      </div>
    </div>
  )
}
