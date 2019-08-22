/**
 * @desc 快捷键
 * control + delete
 * control + c / v / z
 */

import * as React from 'react'
import { ReducerAction } from '../typings'

const { useRef, useEffect, useCallback } = React

interface ShortcutKeyType {
  isActive: boolean,
  dispatch: (actions:ReducerAction[]) => void
}

const onDocumentSelectStart = (event:Event) => {
  event.returnValue = false
}

/**
 * @param isActive
 * @param dispatch
 */
export default function useShortcutKey({
  isActive,
  dispatch,
}: ShortcutKeyType) {

  const isControlDown = useRef<boolean>(false)

  const keyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return

    const keyStr = event.key
    if (keyStr === 'Control')  isControlDown.current = true

    if (!isControlDown.current) return

    event.stopPropagation()
    event.preventDefault()
    document.addEventListener('selectstart', onDocumentSelectStart)

    if (isControlDown.current) {
      switch (keyStr) {
        case 'c':
          dispatch([{
            type: 'copy',
          }])
          break
        case 'v':
          dispatch([{
            type: 'paste',
          }])
          break
        case 'z':
          dispatch([{
            type: 'revert',
          }])
          break
        case 'Backspace':
          dispatch([{
            type: 'delete',
          }])
          break
        default:
          return
      }
    }

  }, [isActive, dispatch])

  const keyUp = useCallback((event: KeyboardEvent) => {
    if (!isActive) return

    const keyStr = event.key
    if (keyStr === 'Control') isControlDown.current = false
    document.removeEventListener('selectstart', onDocumentSelectStart)

  }, [isActive, dispatch])

  useEffect(() => {
    document.addEventListener('keydown', keyDown)
    document.addEventListener('keyup', keyUp)

    return () => {
      document.removeEventListener('keydown', keyDown)
      document.removeEventListener('keyup', keyUp)
    }
  }, [keyDown, keyUp])
}
