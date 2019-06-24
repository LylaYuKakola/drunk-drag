/**
 * @desc 快捷键
 * control + delete
 * shift + 上下左右
 * control + c / v / z
 * shift + clickDown 多选
 */

import * as React from 'react'
import { ReducerActionType } from '../typings'

const { useRef, useEffect, useCallback } = React

interface ShortcutKeyType {
  isActive: boolean,
  dispatch: (actions:ReducerActionType[]) => void
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

  const isControlDown:{current:boolean} = useRef(false)
  const isShiftDown:{current:boolean} = useRef(false)

  const keyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return

    const keyStr = event.key
    if (keyStr === 'Shift') isShiftDown.current = true
    if (keyStr === 'Control')  isControlDown.current = true

    if (
      (isShiftDown.current && isControlDown.current) ||
      (!isShiftDown.current && !isControlDown.current)
    ) return

    event.stopPropagation()
    event.preventDefault()
    document.addEventListener('selectstart', onDocumentSelectStart)

    if (isControlDown.current) {
      switch (keyStr) {
        case 'c':
          break
        case 'v':
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

    if (isShiftDown.current) {
      switch (keyStr) {
        case 'ArrowUp':
          dispatch([{
            type: 'move',
            payload : { data: [0 , -1] },
          }])
          break
        case 'ArrowDown':
          dispatch([{
            type: 'move',
            payload : { data: [0, 1] },
          }])
          break
        case 'ArrowLeft':
          dispatch([{
            type: 'move',
            payload : { data: [-1 , 0] },
          }])
          break
        case 'ArrowRight':
          dispatch([{
            type: 'move',
            payload : { data: [1, 0] },
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
    if (keyStr === 'Shift') isShiftDown.current = false
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
