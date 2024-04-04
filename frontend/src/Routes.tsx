import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LandingPage from "src/libs/views/LandingPage";
import { ProvideAuth } from "src/libs/authContext";
import Register from "src/libs/views/Register";
import Overview from "src/libs/views/Overview";
import NotFound from "src/libs/views/NotFound";
import Board from "src/libs/views/Board";
import Login from "src/libs/views/Login";
import Reactions from "./Reactions";
import BoardV2 from "./libs/views/BoardV2";

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
                            component={BoardV2}
                        />
                        <RouteAny
                            exact
                            path="/board-v1/:boardId"
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
