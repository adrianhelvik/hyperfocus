import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LandingPage from "views/LandingPage";
import { ProvideAuth } from "authContext";
import Register from "views/Register";
import Overview from "views/Overview";
import NotFound from "views/NotFound";
import Reactions from "./Reactions";
import Board from "views/Board";
import Login from "views/Login";

const RouterAny = Router as any;
const SwitchAny = Switch as any;
const RouteAny = Route as any;

export default function Routes() {
    return (
        <ProvideAuth>
            <Reactions>
                <RouterAny>
                    <SwitchAny>
                        <RouteAny exact path="/" component={LandingPage} />
                        <RouteAny exact path="/login" component={Login} />
                        <RouteAny exact path="/app" component={Overview} />
                        <RouteAny
                            exact
                            path="/board/:boardId"
                            component={Board}
                        />
                        <RouteAny exact path="/register" component={Register} />
                        <RouteAny path="*" component={NotFound} />
                    </SwitchAny>
                </RouterAny>
            </Reactions>
        </ProvideAuth>
    );
}
