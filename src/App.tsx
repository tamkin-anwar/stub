import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { Nav } from "./components/Nav";
import { Landing } from "./pages/Landing";
import { AuthPage } from "./pages/Auth";
import { SetupScreen } from "./pages/SetupScreen";
import { MyList } from "./pages/MyList";
import { Library } from "./pages/Library";
import { SharedList } from "./pages/SharedList";
import { Friends } from "./pages/Friends";
import { Settings } from "./pages/Settings";
import { TitlePage } from "./pages/TitlePage";

function AppLayout() {
  const { loading, user } = useAuth();
  if (loading) return <p className="center-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}

export function App() {
  const { configured } = useAuth();

  if (!configured) return <SetupScreen />;

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<MyList />} />
          <Route path="library" element={<Library />} />
          <Route path="shared" element={<SharedList />} />
          <Route path="friends" element={<Friends />} />
          <Route path="settings" element={<Settings />} />
          <Route path="title/:mediaType/:tmdbId" element={<TitlePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
