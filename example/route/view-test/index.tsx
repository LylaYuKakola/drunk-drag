import * as React from 'react'
import $D from '../../../src'
import config from '../../config'
import './index.scss'

const { useState, useCallback, useRef, useEffect } = React
const { Viewer } = $D

export default function () {

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowDown') {
      $D('viewer', '001').goToNextViewport()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="test">
      <div className="test-viewer">
        <Viewer
          {...config}
          id="001"
          style={{ backgroundColor: '#f3f1ef' }}
        />
      </div>
    </div>
  )
}
