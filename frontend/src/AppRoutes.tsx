import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "src/libs/views/login-and-register/Register";
import Login from "src/libs/views/login-and-register/Login";
import LandingPage from "src/libs/views/LandingPage";
import { ProvideAuth } from "src/libs/authContext";
import Overview from "src/libs/views/Overview";
import NotFound from "src/libs/views/NotFound";
import BoardV2 from "src/libs/views/BoardV2";
import Admin from "src/libs/views/Admin";
import BoardsController from "./libs/BoardsController";

export default function AppRoutes() {
  return (
    <ProvideAuth>
      <BoardsController>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<Overview />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/board/:boardId" element={<BoardV2 />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </BoardsController>
    </ProvideAuth>
  );
}
