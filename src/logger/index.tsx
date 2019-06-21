/**
 * @desc 打印错误
 */

export class NormalError extends Error {
  constructor(message:string) {
    super(message)
    this.name = 'normal'
  }
}

export const log = (e:Error|string, withStack = false) => {
  const error = typeof e !== 'string' ? e : new NormalError(e)
  console.log(`${error.name}:`, error.message)
  if (withStack) console.log(error.stack)
}
export const warn = (e:Error|string, withStack = false) => {
  const error = typeof e !== 'string' ? e : new NormalError(e)
  console.warn(`${error.name}:`, error.message)
  if (withStack) console.warn(error.stack)
}
export const error = (e:Error|string, withStack = false) => {
  const error = typeof e !== 'string' ? e : new NormalError(e)
  console.error(`${error.name}:`, error.message)
  if (withStack) console.error(error.stack)
}
