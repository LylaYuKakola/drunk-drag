import * as React from 'react'
import editor from './components/Page/editor'
import viewer from './components/Page/viewer'
import Elements from './components/Elements'
import * as tj from './util/typeJudgement'
import '../font/iconfont.css'

const cache = {
  elementsPool: new Set(Object.keys(Elements)),
  editorInstancesMap: new Map(),
  viewerInstancesMap: new Map(),
}

const registerElement = (elements:any) => {
  const keys = Object.keys(elements)
  keys.forEach((key:string) => {
    const elementComponent = elements[key]

    if (!(tj.isFunction(elementComponent))) {
      console.warn(`"${key}" cannot be registered, because it's not a React component`)
      return
    }

    const component = new elementComponent({})
    if (!component || component instanceof React.Component || React.isValidElement(component)) {
      Elements[key] = elementComponent
      cache.elementsPool.add(String(key))
    }
  })
}

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

const getViewer = (id:string) => cache.viewerInstancesMap.get(id) || null
const getEditor = (id:string) => cache.editorInstancesMap.get(id) || null

export interface DrunkDragType {
  registerElement: any,
  unregisterElement: any,
  hasElement: any,
  getAllElementKeys: any,
  getViewer: any,
  getEditor: any,
  Editor: any,
  Viewer: any,
}

export default Object.freeze({
  registerElement,
  unregisterElement,
  hasElement,
  getAllElementKeys,
  getViewer,
  getEditor,
  Editor: new Proxy(editor, {
    apply (target, ctx, args) {
      const newEditorInstance = Reflect.apply(target, ctx, args)
      const id = newEditorInstance.ref.current ? newEditorInstance.ref.current.id : null
      cache.editorInstancesMap.set(id, newEditorInstance)
      return newEditorInstance
    },
  }),
  Viewer: new Proxy(viewer, {
    apply (target, ctx, args) {
      const newViewerInstance = Reflect.apply(target, ctx, args)
      const id = newViewerInstance.ref.current ? newViewerInstance.ref.current.id : null
      cache.viewerInstancesMap.set(id, newViewerInstance)
      return newViewerInstance
    },
  }),
})
