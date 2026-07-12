import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Onboarding from "./pages/Onboarding/Onboarding";
import Main from "./pages/Main/Main";
import History from "./pages/History/History";
import MyCapital from "./pages/MyCapital/MyCapital";
import { ProtectedRoute, RedirectIfAuthed } from "./auth/ProtectedRoute";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout/AuthenticatedLayout";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthed>
            <Register />
          </RedirectIfAuthed>
        }
      />
      <Route element={<AuthenticatedLayout />}>
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute requireOnboarded>
              <Main />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute requireOnboarded>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-capital"
          element={
            <ProtectedRoute requireOnboarded>
              <MyCapital />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
