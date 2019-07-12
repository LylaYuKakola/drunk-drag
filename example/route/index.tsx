import * as React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import EditorTest from './editor-test'
import ViewTest from './view-test'
import ViewportTest from './viewport-test'
import AdaptiveTest from './adaptive-test'

export default () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/edit" component={EditorTest} />
        <Route path="/view" component={ViewTest} />
        <Route path="/viewport" component={ViewportTest} />
        <Route path="/adaptive" component={AdaptiveTest} />
      </Switch>
    </HashRouter>
  )
}
