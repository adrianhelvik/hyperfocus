import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "src/libs/views/LandingPage";
import { ProvideAuth } from "src/libs/authContext";
import Register from "src/libs/views/Register";
import Overview from "src/libs/views/Overview";
import NotFound from "src/libs/views/NotFound";
import BoardV2 from "src/libs/views/BoardV2";
import Board from "src/libs/views/Board";
import Login from "src/libs/views/Login";
import Reactions from "./Reactions";

export default function AppRoutes() {
  return (
    <ProvideAuth>
      <Reactions>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<Overview />} />
            <Route path="/board/:boardId" element={<BoardV2 />} />
            <Route path="/board-v1/:boardId" element={<Board />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Reactions>
    </ProvideAuth>
  );
}
