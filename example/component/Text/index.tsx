import * as React from 'react'

interface TextPropsType {
  containerStyle: any,
  word: string,
  [key:string]: any
}

export default function ({ containerStyle, word }:TextPropsType) {
  const style = {
    fontSize: 24,
    wordBreak: 'break-all',
    ...containerStyle,
  }
  return (<div style={style}>{ word || '空TEXT' }</div>)
}
