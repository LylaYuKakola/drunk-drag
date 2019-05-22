import * as React from 'react'

const allChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const replacer = ():string => allChars[Math.floor(Math.random() * 62)]
export default ():string => 'xxxx-xxxx'.replace(/[x]/g, replacer)
