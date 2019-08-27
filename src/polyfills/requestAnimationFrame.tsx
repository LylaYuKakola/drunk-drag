/**
 * @desc requestAnimationFrame的polyfill
 */

if (!Date.now) Date.now = () => new Date().getTime()

function requestAnimationFramePolyfill() {
  'use strict'

  if (window.requestAnimationFrame) return

  // webkit or moz
  if ((window as any).webkitRequestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame
    window.cancelAnimationFrame = window.webkitCancelAnimationFrame
  } else if ((window as any).mozRequestAnimationFrame) {
    window.requestAnimationFrame = (window as any).mozRequestAnimationFrame
    window.cancelAnimationFrame = (window as any).mozCancelAnimationFrame
  }

  // 还是没有，用setTimeout实现
  if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    let lastTime = 0

    window.requestAnimationFrame = function requestAnimationFrame(callback:FrameRequestCallback) {
      const now = Date.now()
      const nextTime = Math.max(lastTime + 16, now)
      const timer = setTimeout(() => {
        callback(nextTime)
        lastTime = nextTime
      }, nextTime - now)
      return (timer as any)
    }

    window.cancelAnimationFrame = clearTimeout
  }

}

requestAnimationFramePolyfill()
