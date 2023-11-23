import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import LandingPage from 'views/LandingPage'
import { ProvideAuth } from 'authContext'
import Register from 'views/Register'
import Overview from 'views/Overview'
import NotFound from 'views/NotFound'
import Reactions from './Reactions'
import Board from 'views/Board'
import Login from 'views/Login'

export default function Routes() {
  return (
    <ProvideAuth>
      <Reactions>
        <Router>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/app" component={Overview} />
            <Route exact path="/board/:boardId" component={Board} />
            <Route exact path="/register" component={Register} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Router>
      </Reactions>
    </ProvideAuth>
  )
}
