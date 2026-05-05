import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import Users from "./pages/Users";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        } />
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;