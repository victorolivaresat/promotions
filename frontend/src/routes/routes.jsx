import { Route, Routes, Navigate } from "react-router-dom";
import RouteTransition from "../utils/RouteTransition";
import NotFound from "../pages/NotFound/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import User from "../pages/Users/User";


const urlBasic = import.meta.env.VITE_URL;

const AppRoutes = () => (
  <Routes>
    <Route
      path={urlBasic + "login"}
      element={
        <RouteTransition>
          <Login />
        </RouteTransition>
      }
    />
    <Route element={<ProtectedRoute />}>
      <Route
        path={urlBasic}
        element={
          <RouteTransition>
            <Home />
          </RouteTransition>
        }
      />

      <Route
        path={urlBasic + "user"}
        element={
          <RouteTransition>
            <User />
          </RouteTransition>
        }
      />

      <Route
        path="*"
        element={
          <RouteTransition>
            <NotFound />
          </RouteTransition>
        }
      />
    </Route>
    <Route path="*" element={<Navigate to={urlBasic + "login"} />} />
  </Routes>
);

export default AppRoutes;
