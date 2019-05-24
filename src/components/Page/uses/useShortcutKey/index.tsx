/**
 * @desc 快捷键
 * control + delete
 * shift + 上下左右
 * control + c / v / z
 * shift + clickDown 多选
 */

import * as React from 'react'
import { ReducerActionType } from '../../../../typings'

const { useRef, useEffect, useCallback } = React

interface ShortcutKeyType {
  isActive: boolean,
  dispatch: (actions:ReducerActionType[]) => void
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

  const mouseDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return

    const keyStr = event.key
    if (keyStr === 'Shift') isShiftDown.current = true
    if (keyStr === 'Control') isControlDown.current = true

    if (
      (isShiftDown.current && isControlDown.current) ||
      (!isShiftDown.current && !isControlDown.current)
    ) return

    event.stopPropagation()

    if (isControlDown.current) {
      switch (keyStr) {
        case 'C':
          break
        case 'V':
          break
        case 'Z':
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

  const mouseUp = useCallback((event: KeyboardEvent) => {
    if (!isActive) return

    const keyStr = event.key
    if (keyStr === 'Shift') isShiftDown.current = false
    if (keyStr === 'Control') isControlDown.current = false

  }, [isActive, dispatch])

  useEffect(() => {
    document.addEventListener('keydown', mouseDown)
    document.addEventListener('keyup', mouseUp)

    return () => {
      document.removeEventListener('keydown', mouseDown)
      document.removeEventListener('keyup', mouseUp)
    }
  }, [mouseDown, mouseUp])
}
