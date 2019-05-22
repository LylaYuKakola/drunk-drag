/** cell的内容集合 **/

import * as React from 'react'

export default new Proxy(Object.create(null), {
  get(target, property):any {
    if (!property || property === 'undefined' || !Reflect.has(target, property)) {
      return ():null => null
    }
    return Reflect.get(target, property)
  },

  set(target, property:string, value) {
    if (Reflect.has(target, property)) {
      console.warn(`"${property}" cannot be set cause it has been registered`)
      return true
    }
    return Reflect.set(target, property, value)
  },
})
