import { PlainObjectType } from '../typings'

export default function deepCopy(obj:PlainObjectType):PlainObjectType {
  const result:PlainObjectType = Array.isArray(obj) ? [] : {}
  Object.keys(obj).forEach((key: string|number) => {
    if (typeof obj[key] === 'object') {
      result[key] = this.deepCopy(obj[key]) // 递归复制
    } else {
      result[key] = obj[key]
    }
  })
  return result
}
