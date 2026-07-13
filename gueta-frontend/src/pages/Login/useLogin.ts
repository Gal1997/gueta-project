import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useAuth } from "../../auth/AuthContext";
import { requestGoogleAccessToken } from "../../auth/google";
import { ERRORS, VALIDATION } from "./consts";
import { navigateAfterAuth } from "./utils";

export function useLogin() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [demoNewLoading, setDemoNewLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (value ? null : VALIDATION.email),
      password: (value) => (value ? null : VALIDATION.password),
    },
  });

  async function handleLogin(values: typeof form.values) {
    setSubmitting(true);
    try {
      const user = await login(values);
      navigateAfterAuth(navigate, user);
    } catch (error) {
      form.setErrors({
        email: " ",
        password: error instanceof Error ? error.message : ERRORS.loginFailed,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const accessToken = await requestGoogleAccessToken();
      const user = await loginWithGoogle(accessToken);
      navigateAfterAuth(navigate, user);
    } catch (error) {
      setGoogleError(
        error instanceof Error ? error.message : ERRORS.googleFailed,
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleDemoLogin() {
    setSubmitting(true);
    try {
      const user = await login({
        email: "avi@avi.com",
        password: "123456",
      });
      navigateAfterAuth(navigate, user);
    } catch (error) {
      form.setErrors({
        email: " ",
        password: error instanceof Error ? error.message : ERRORS.loginFailed,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoNewUser() {
    setDemoNewLoading(true);
    try {
      const suffix = crypto.randomUUID().slice(0, 8);
      await register({
        name: "משתמש דמו",
        email: `demo-${suffix}@test.local`,
        password: `demo-${suffix}`,
      });
      navigate("/onboarding");
    } catch (error) {
      form.setErrors({
        email: " ",
        password:
          error instanceof Error ? error.message : ERRORS.registerFailed,
      });
    } finally {
      setDemoNewLoading(false);
    }
  }

  return {
    form,
    submitting,
    demoNewLoading,
    googleLoading,
    googleError,
    handleLogin,
    handleDemoLogin,
    handleDemoNewUser,
    handleGoogle,
  };
}
