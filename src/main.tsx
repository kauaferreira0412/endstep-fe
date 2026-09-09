import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/common/Layout/container";
import { ProtectedRoute } from "@/components/common/ProtectedRoute/container";
import { Dialogs } from "@/components/common/Dialogs/container";
import { CardSearchPage } from "@/pages/cards/container";
import { SyncPage } from "@/pages/sync/container";
import { AdminUsersPage } from "@/pages/admin-users/container";
import { LoginPage } from "@/pages/login/container";
import { RegisterPage } from "@/pages/register/container";
import { AuthCallbackPage } from "@/pages/auth-callback/container";
import { DecksPage } from "@/features/decks/DecksPage";
import { RoomsPage } from "@/pages/rooms/container";
import { RoomLobby } from "@/pages/room-lobby/container";
import { GameTable } from "@/features/game/GameTable";
import { useAuthStore } from "@/stores/authStore";
import "./index.css";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  {
    path: "/game/:id",
    element: (
      <ProtectedRoute>
        <GameTable />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/cards" replace /> },
      { path: "cards", element: <CardSearchPage /> },
      { path: "decks", element: <DecksPage /> },
      { path: "play", element: <RoomsPage /> },
      { path: "play/:code", element: <RoomLobby /> },
      {
        path: "admin/sync",
        element: (
          <ProtectedRoute permission="SYNC">
            <SyncPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute role="ADMIN">
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Navigate to="/cards" replace /> },
    ],
  },
]);

function Root() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
  return (
    <>
      <RouterProvider router={router} />
      <Dialogs />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
