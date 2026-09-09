import { Suspense, useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DocumentTitle } from "./components/DocumentTitle";
import { Nav } from "./components/Nav";
import { SetupScreen } from "./pages/SetupScreen";
import { lazyRetry } from "./lib/lazyRetry";

// Landing and auth are the first paint; the rest load on navigation.
import { Landing } from "./pages/Landing";
import { AuthPage } from "./pages/Auth";
const Privacy = lazyRetry(() => import("./pages/Legal").then((m) => ({ default: m.Privacy })));
const Terms = lazyRetry(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const Home = lazyRetry(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const MyList = lazyRetry(() => import("./pages/MyList").then((m) => ({ default: m.MyList })));
const Library = lazyRetry(() => import("./pages/Library").then((m) => ({ default: m.Library })));
const SharedList = lazyRetry(() => import("./pages/SharedList").then((m) => ({ default: m.SharedList })));
const Friends = lazyRetry(() => import("./pages/Friends").then((m) => ({ default: m.Friends })));
const Compare = lazyRetry(() => import("./pages/Compare").then((m) => ({ default: m.Compare })));
const Settings = lazyRetry(() => import("./pages/Settings").then((m) => ({ default: m.Settings })));
const TitlePage = lazyRetry(() => import("./pages/TitlePage").then((m) => ({ default: m.TitlePage })));

function Loading() {
  return <p className="center-note">Loading…</p>;
}

function AppLayout() {
  const { loading, user, profile, profileChecked, signOut } = useAuth();

  // A session whose profile row is gone (account deleted, or the sign-up trigger
  // never ran) is unusable. Clear it and send the person back to sign in.
  const orphaned = !!user && profileChecked && !profile;
  useEffect(() => {
    if (orphaned) void signOut();
  }, [orphaned, signOut]);

  if (loading) return <Loading />;
  if (!user || orphaned) return <Navigate to="/login" replace />;
  if (!profileChecked) return <Loading />;
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}

export function App() {
  const { configured } = useAuth();

  if (!configured) return <SetupScreen />;

  return (
    <ToastProvider>
      <DocumentTitle />
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="list" element={<MyList />} />
              <Route path="library" element={<Library />} />
              <Route path="shared" element={<SharedList />} />
              <Route path="friends" element={<Friends />} />
              <Route path="compare/:friendId" element={<Compare />} />
              <Route path="settings" element={<Settings />} />
              <Route path="title/:mediaType/:tmdbId" element={<TitlePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  );
}
