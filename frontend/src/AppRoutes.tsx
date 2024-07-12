import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "src/libs/views/LandingPage";
import { ProvideAuth } from "src/libs/authContext";
import Register from "src/libs/views/Register";
import Overview from "src/libs/views/Overview";
import NotFound from "src/libs/views/NotFound";
import BoardV2 from "src/libs/views/BoardV2";
import Login from "src/libs/views/Login";

export default function AppRoutes() {
  return (
    <ProvideAuth>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Overview />} />
          <Route path="/board/:boardId" element={<BoardV2 />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ProvideAuth>
  );
}
