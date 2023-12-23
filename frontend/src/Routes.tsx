import { Router, Route } from "@solidjs/router";
import LandingPage from "views/LandingPage";

/*
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ProvideAuth } from 'authContext'
import NotFound from 'views/NotFound'
import Reactions from './Reactions'
import Board from 'views/Board'
*/
import Register from "views/Register";
import Overview from "views/Overview";
import Login from "views/Login";

export default function () {
    return (
        <Router>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/app" component={Overview} />
        </Router>
    );

    /*
  return (
    <>
      <Route exact path="/" component={LandingPage} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/app" component={Overview} />
      <Route exact path="/board/:boardId" component={Board} />
      <Route exact path="/register" component={Register} />
      <Route path="*" component={NotFound} />
    </>
  )
  */
}
