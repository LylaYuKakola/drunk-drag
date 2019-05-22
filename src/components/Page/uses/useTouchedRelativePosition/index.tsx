/**
 * @desc 获取点击事件相对于编辑面板的相对位置
 */

import * as React from 'react'

const { useLayoutEffect, useRef } = React

/**
 * @param panel 编辑面板的ref
 * @return {function:(event) => [relativeX, relativeY]} 用来根据点击位置获取相对面板的位置
 */
export default function useTouchedRelativePosition(panel:HTMLDivElement) {

  const panelRect = useRef({ left: 0, top: 0 })

  useLayoutEffect(() => {
    if (panel) {
      panelRect.current = panel.getBoundingClientRect()
    }
  }, [panel])

  return (event: any): [number, number] => {
    if (event.type.startsWith('mouse') || (event.type === 'contextmenu')) {
      return [event.clientX - panelRect.current.left, event.clientY - panelRect.current.top]
    }
    return [
      event.touches[0].clientX - panelRect.current.left,
      event.touches[0].clientY - panelRect.current.top,
    ]
  }
}
