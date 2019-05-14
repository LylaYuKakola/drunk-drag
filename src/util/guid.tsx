import * as React from 'react'
import { PlainObjectType } from '../typings'

const allChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function replacer() {
  return allChars[Math.floor(Math.random() * 62)]
}

export function guid():string {
  return 'xxxx-xxxx'.replace(/[x]/g, replacer)
}
