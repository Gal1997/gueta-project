import type { NavigateFunction } from "react-router-dom";
import type { User } from "../../auth/authApi";

export function navigateAfterAuth(navigate: NavigateFunction, user: User) {
  navigate(user.onboarded ? "/main" : "/onboarding");
}
