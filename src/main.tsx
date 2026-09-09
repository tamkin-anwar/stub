import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./context/AuthContext";
import { initMonitoring } from "./lib/monitoring";
import "./styles/global.css";

initMonitoring();

// A chunk that 404s after a deploy landed mid-session: reload once to pick
// up the fresh index.html. lazyRetry handles the route case; this is the
// backstop for Vite's own module preloads.
window.addEventListener("vite:preloadError", (e) => {
  e.preventDefault();
  try {
    if (sessionStorage.getItem("stub-chunk-reload") === "1") return;
    sessionStorage.setItem("stub-chunk-reload", "1");
  } catch {
    /* private mode */
  }
  window.location.reload();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
