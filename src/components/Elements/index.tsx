import * as React from 'react'
import FlexBlock from './FlexBlock'

const elementsPool = Object.create(null)
elementsPool.FlexBlock = FlexBlock
elementsPool.Background = () => (<div />)

export default new Proxy(elementsPool, {
  get(target, property):any {
    // 引用不存在
    if (!property || property === 'undefined' || !Reflect.has(target, property)) {
      // 不存在时或者为空时，返回空函数
      return ():null => null
    }
    return Reflect.get(target, property)
  },

  set(target, property:string, value) {
    // 控制不能重复注册
    if (Reflect.has(target, property)) {
      console.warn(`"${property}" cannot be set cause it has been registered`)
      return true
    }

    return Reflect.set(target, property, value)
  },
})
