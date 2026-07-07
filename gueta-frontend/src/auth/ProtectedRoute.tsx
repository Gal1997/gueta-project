import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "./AuthContext";
import classes from "../pages/pages.module.css";

function FullPageLoader() {
  return (
    <Center className={classes.fullPage}>
      <Loader />
    </Center>
  );
}

export function ProtectedRoute({
  children,
  requireOnboarded = false,
}: {
  children: ReactNode;
  requireOnboarded?: boolean;
}) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/" replace />;
  if (requireOnboarded && !user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (user) {
    return <Navigate to={user.onboarded ? "/main" : "/onboarding"} replace />;
  }

  return <>{children}</>;
}
