// 是项目的JS打包入口文件
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Route from './route'
import DD from '../src'

// 导入项目的根组件
import Core from '../src/index'

import Text from './component/Text'
import Image from './component/Image'

DD.registerElement({
  Text, Image,
})

ReactDOM.render(<Route />, document.getElementById('root'))
