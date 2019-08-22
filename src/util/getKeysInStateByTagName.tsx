import { ELEMENT } from './constants'

interface Result {
  key: string,
  selectedKey: string,
  otherKey: string,
  otherSelectedKey: string,
}

const getKeysInStateByTagName:(tag:string) => Result = (tag) => {
  return tag === ELEMENT ?
    ({
      key: 'allElements',
      selectedKey: 'selectedElements',
      otherKey: 'allViewports',
      otherSelectedKey: 'selectedViewports',
    }) : ({
      key: 'allViewports',
      selectedKey: 'selectedViewports',
      otherKey: 'allElements',
      otherSelectedKey: 'selectedElements',
    })
}

export default getKeysInStateByTagName
