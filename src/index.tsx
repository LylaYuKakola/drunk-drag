import * as React from 'react'
import contents from './contents'
import { commanders } from './commander'
import editor from './components/Editor'
import viewer from './components/Viewer'
import '../font/iconfont.css'
import { warn } from './logger'
import { DrunkDragType } from './typings'

const cache = {
  editorInstancesMap: new Map(),
  viewerInstancesMap: new Map(),
}

const registerElement = (types:any) => {
  Object.keys(types).forEach((key:string) => {
    contents[key] = types[key]
  })
}

const unregisterElement = (key:string) => {
  Reflect.deleteProperty(contents, key)
}

// elements上是否有当前类型的组件
const hasElement = (key:string):boolean => {
  return Reflect.has(contents, key)
}

// 获取elements上所有的类型的key
const getAllElementKeys = () => {
  return [...contents.keys()]
}

const $D = (componentName:string, cid:string) => {
  const commander = commanders.get(`${componentName}-${cid}`)
  if (!commander) {
    warn(`get no instance, check component name "${componentName}" and instance id "${cid}"`)
    return null
  }
  return commander
}
Reflect.setPrototypeOf($D, Object.freeze({
  registerElement,
  unregisterElement,
  hasElement,
  getAllElementKeys,
  Editor: editor,
  Viewer: viewer,
}))

// @ts-ignore
if (window)  window['$D'] = $D
export default $D
