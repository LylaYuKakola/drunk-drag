/**
 * @desc 深度克隆，object|array
 */

export default function deepCopy(obj:any):any {
  const result:any = Array.isArray(obj) ? [] : {}
  Object.keys(obj).forEach((key: string|number) => {
    if (typeof obj[key] === 'object') {
      result[key] = deepCopy(obj[key]) // 递归复制
    } else {
      result[key] = obj[key]
    }
  })
  return result
}
