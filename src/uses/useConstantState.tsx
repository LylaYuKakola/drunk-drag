import * as React from 'react'

const { useState } = React

export default function useConstantState(value:any) {
  const [constant] = useState(value)
  return constant
}
