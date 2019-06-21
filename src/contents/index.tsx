/**
 * @desc cell的内容，组件集合
 *
 * 通过$D的register和unregister来操作，为Cell提供内容组件k-v
 */

import * as React from 'react'
import { warn, error } from '../logger'
import * as tj from '../util/typeJudgement'

const returnNull = ():null => null

export default new Proxy(Object.create(null), {
  get(target, property:string):any {
    if (!property || property === 'undefined' || !Reflect.has(target, property)) {
      warn(
        `Type "${property}" of contents is not in contents.
        Use "$D.hasElement" to judge this type's existent
        Use "$D.getAllContentKey" to get all types in contents`,
      )
      return
    }
    return Reflect.get(target, property)
  },

  set(target, property:string, value:any) {
    if (Reflect.has(target, property)) {
      error(
        `Type "${property}" cannot be set, cause it has been registered`,
      )
      return true
    }
    if (!tj.isFunction(value)) {
      warn(
        `Type "${property}" cannot be set, cause it's not a React component`,
      )
      return true
    }

    return Reflect.set(target, property, value)
  },

  deleteProperty(target, property:string) {
    if (!Reflect.has(target, property)) {
      warn(
        `Cannot delete nonexistent type "${property}"`,
      )
    }
    return true
  },
})
