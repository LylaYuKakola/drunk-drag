import * as React from 'react'
import { HashRouter, Switch, Route } from 'react-router-dom'
import PageTest from './page-test'

export default () => {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={PageTest} />
      </Switch>
    </HashRouter>
  )
}
