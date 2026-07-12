import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasLength, isEmail, matchesField, useForm } from "@mantine/form";
import { useAuth } from "../../auth/AuthContext";
import { requestGoogleAccessToken } from "../../auth/google";
import { ERRORS } from "./consts";
import { navigateAfterGoogleAuth, navigateAfterRegister } from "./utils";

export function useRegister() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validate: {
      name: hasLength({ min: 2 }, "נא להזין שם"),
      email: isEmail("נא להזין אימייל תקין"),
      password: hasLength({ min: 6 }, "הסיסמה חייבת להכיל לפחות 6 תווים"),
      confirmPassword: matchesField("password", "הסיסמאות אינן תואמות"),
    },
  });

  async function handleRegister(values: typeof form.values) {
    setSubmitting(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigateAfterRegister(navigate);
    } catch (error) {
      form.setFieldError(
        "email",
        error instanceof Error ? error.message : ERRORS.registerFailed,
      );
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
      navigateAfterGoogleAuth(navigate, user);
    } catch (error) {
      setGoogleError(
        error instanceof Error ? error.message : ERRORS.googleFailed,
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return {
    form,
    submitting,
    googleLoading,
    googleError,
    handleRegister,
    handleGoogle,
  };
}
