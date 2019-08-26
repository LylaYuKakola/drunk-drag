import * as React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import EditorTest from './editor-test'
import ViewTest from './view-test'

export default () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/edit" component={EditorTest} />
        <Route path="/view" component={ViewTest} />
      </Switch>
    </HashRouter>
  )
}
