import * as React from 'react'

interface ImagePropsType {
  containerStyle: any,
  url: string,
}

const commonBackgroundStyle = {
  position: 'relative',
  height: '100%',
  width: '100%',
  backgroundSize: '100% 100%',
}

export default function ({ containerStyle, url }:ImagePropsType) {
  const style = {
    ...commonBackgroundStyle,
    ...containerStyle,
    backgroundImage: `url('${url}')`,
  }
  return (<div style={style} />)
}
