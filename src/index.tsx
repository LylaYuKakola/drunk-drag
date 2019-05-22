import * as React from 'react'
import editor from './components/Page/editor'
import viewer from './components/Page/viewer'
import Elements from './components/Elements'
import '../font/iconfont.css'

const cache = {
  elementsPool: new Set(Object.keys(Elements)),
}

const registerElement = (elements:any) => {
  const keys = Object.keys(elements)
  keys.forEach((key:string) => {
    const elementComponent = elements[key]

    if (typeof elementComponent !== 'function') {
      console.warn(`"${key}" cannot be registered cause it's not a React component`)
      return
    }

    const component = new elementComponent({})
    if (!component || component instanceof React.Component || React.isValidElement(component)) {
      Elements[key] = elementComponent
      cache.elementsPool.add(String(key))
    }
  })
}

// 解绑react组件到elements上
const unregisterElement = (key:string):boolean => {
  if (Reflect.has(Elements, key)) {
    Reflect.deleteProperty(Elements, key)
    return true
  }
  return false
}

// elements上是否有当前类型的组件
const hasElement = (key:string):boolean => {
  return Reflect.has(Elements, key)
}

// 获取elements上所有的类型的key
const getAllElementKeys = () => {
  return [...cache.elementsPool]
}

export interface DrunkDragType {
  registerElement: any,
  unregisterElement: any,
  hasElement: any,
  getAllElementKeys: any,
  Editor: any,
  Viewer: any,
}

export default Object.freeze({
  registerElement,
  unregisterElement,
  hasElement,
  getAllElementKeys,
  Editor: editor,
  Viewer: viewer,
})
