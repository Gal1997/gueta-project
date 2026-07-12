import type { NavigateFunction } from "react-router-dom";
import type { User } from "../../auth/authApi";

export function navigateAfterRegister(navigate: NavigateFunction) {
  navigate("/onboarding");
}

export function navigateAfterGoogleAuth(navigate: NavigateFunction, user: User) {
  navigate(user.onboarded ? "/main" : "/onboarding");
}
