import * as React from 'react'
import DDEditor from '../components/Page/editor'
import DDViewer from '../components/Page/viewer'
import Elements from '../components/Elements'

const Cache = {
  elementsPool: new Set(Object.keys(Elements)),
  // PageInstances: Object.create(null),
  // CanvasInstances: Object.create(null),
}

// 注册react组件到elements上
const registerElement = (elements:any) => {
  const keys = Object.keys(elements)
  keys.forEach(key => {
    const ElementComponent = elements[key]

    // 判断函数返回的不是有效的react的element
    if (typeof ElementComponent !== 'function') {
      console.warn(`"${key}" cannot be registered cause it's not a React component`)
      return
    }

    const component = new ElementComponent({})
    if (!component || component instanceof React.Component || React.isValidElement(component)) {
      Elements[key] = ElementComponent
      Cache.elementsPool.add(String(key))
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
  return [...Cache.elementsPool]
}

export default new Proxy({
  DDViewer,
  registerElement,
  unregisterElement,
  hasElement,
  getAllElementKeys,
  DDEditor,
}, {

  set() {
    return false
  },

})
