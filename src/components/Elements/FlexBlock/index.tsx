import * as React from 'react'
import { FlexBlockPropsType } from '../../../typings'

const { useMemo } = React

export default function ({ isPurePage }:FlexBlockPropsType) {

  const style = useMemo(() => ({
    width: '100%',
    height: '100%',
    background: !isPurePage ? 'rgba(184, 255, 136, 0.7)' : 'rgba(0, 0, 0, 0)',
  }), [isPurePage])

  return (
    <div style={style} />
  )
}
