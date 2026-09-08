import { useEffect } from "react";
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
  const { loading, user, profile, profileChecked, signOut } = useAuth();

  // A session whose profile row is gone (account deleted, or the sign-up trigger
  // never ran) is unusable. Clear it and send the person back to sign in.
  const orphaned = !!user && profileChecked && !profile;
  useEffect(() => {
    if (orphaned) void signOut();
  }, [orphaned, signOut]);

  if (loading) return <p className="center-note">Loading…</p>;
  if (!user || orphaned) return <Navigate to="/login" replace />;
  if (!profileChecked) return <p className="center-note">Loading…</p>;
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
