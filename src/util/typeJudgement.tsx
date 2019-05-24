/**
 * @desc 类型判断
 */

export const isFunction = (arg:any):boolean => Object.prototype.toString.call(arg) === '[object Function]'
export const isArray = (arg:any):boolean => Object.prototype.toString.call(arg) === '[object Array]'
export const isNull = (arg:any):boolean => Object.prototype.toString.call(arg) === '[object Null]'
export const isUndefined = (arg:any):boolean => Object.prototype.toString.call(arg) === '[object Undefined]'
export const cannotNumberUsed = (arg:any):boolean => Number.isNaN(parseFloat(arg))
