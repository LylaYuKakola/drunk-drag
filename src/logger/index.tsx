/**
 * @desc 打印错误
 */

export const log = (msg:string) => {
  console.log('tip:\n', msg)
}
export const warn = (msg:string) => {
  console.warn('warn:\n', msg)
}
export const error = (msg:string) => {
  console.error('error:\n', msg)
}
