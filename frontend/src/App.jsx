import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";

// Apply saved theme before first render
const savedTheme = localStorage.getItem("chat-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

function App() {
  const { authUser } = useAuthContext();
  return (
    <div className="h-screen flex flex-col">
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={
            authUser ? (
              <Navigate to="/" />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 h-screen">
                <Login />
              </div>
            )
          }
        />
        <Route
          path="/signup"
          element={
            authUser ? (
              <Navigate to="/" />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 h-screen overflow-y-auto">
                <SignUp />
              </div>
            )
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f9fafb",
            border: "1px solid #374151",
          },
        }}
      />
    </div>
  );
}

export default App;
