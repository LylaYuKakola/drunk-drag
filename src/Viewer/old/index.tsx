import AdaptiveViewer from './adaptive'
import Basic from './basic'
import ViewportViewer from './viewport'

export default new Proxy(Basic, {
  get(target, property:string):any {
    if (property === 'Adaptive') return AdaptiveViewer
    if (property === 'Viewport') return ViewportViewer
    return Reflect.get(target, property)
  },
})
