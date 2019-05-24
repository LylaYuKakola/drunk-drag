/**
 * @desc 相关id获取
 */

const allChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const replacer = ():string => allChars[Math.floor(Math.random() * 62)]
const guid = ():string => 'xxxxxxxx'.replace(/[x]/g, replacer)

export const getEditorId:(id:string) => string = id => id || guid()
export const getViewerId:(id:string) => string = id => id || guid()
export const getCellId:(id:string) => string = id => id || guid()
