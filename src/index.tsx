import * as React from 'react'
import contents from './contents'
import { commanders } from './commander'
import Editor from './components/Editor'
import Viewer from './components/Viewer'
import '../font/iconfont.css'
import { warn } from './logger'

const register = (types:any) => {
  Object.keys(types).forEach((key:string) => {
    contents[key] = types[key]
  })
}

const unregister = (key:string) => {
  Reflect.deleteProperty(contents, key)
}

const hasType = (key:string):boolean => {
  return Reflect.has(contents, key)
}

const getAllTypes = () => {
  return [...contents.keys()]
}

const $D = (componentName:string, cid:string) => {
  const commander = commanders.get(`${componentName}-${cid}`)
  if (!commander) {
    warn(`get no instance, check the component name "${componentName}" and instance id "${cid}"`)
    return null
  }
  return commander
}
Reflect.setPrototypeOf($D, Object.freeze({
  register,
  unregister,
  hasType,
  getAllTypes,
  Editor,
  Viewer,
}))

// @ts-ignore @TODO 方便测试
if (window)  window['$D'] = $D
export default $D as any
