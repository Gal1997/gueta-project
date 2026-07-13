import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useAuth } from "../../auth/AuthContext";
import type { SpendingCategory } from "../../auth/authApi";
import { getCategories } from "../../auth/authApi";
import {
  ERRORS,
  INITIAL_OPEN_SECTIONS,
  ONBOARDING_SECTIONS,
  makeAvailableCash,
  makeExpense,
  makeFutureMoney,
  makeGoal,
  makeIncome,
  makeInvestment,
  type OnboardingFormValues,
  type OnboardingPayload,
  type OnboardingSectionId,
} from "./consts";
import { validateOnboardingForm, validateOnboardingSection } from "./utils";

export function useOnboarding() {
  const navigate = useNavigate();
  const { user, logout, completeOnboarding, skipOnboarding } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [openSections, setOpenSections] = useState<string[]>(INITIAL_OPEN_SECTIONS);
  const [submitError, setSubmitError] = useState("");
  const [categories, setCategories] = useState<SpendingCategory[]>([]);

  const refreshCategories = useCallback(async () => {
    try {
      const next = await getCategories();
      setCategories(next);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  const form = useForm<OnboardingFormValues>({
    mode: "uncontrolled",
    initialValues: {
      availableCash: [makeAvailableCash()],
      investments: [makeInvestment()],
      futureMoney: [makeFutureMoney()],
      incomes: [makeIncome()],
      expenses: [makeExpense()],
      goals: [makeGoal()],
    },
  });

  function handleContinue(section: OnboardingSectionId) {
    setSubmitError("");
    form.clearErrors();
    const values = form.getValues();
    const isValid = validateOnboardingSection(form, values, section);

    if (!isValid) {
      setOpenSections([section]);
      bumpFormVersion();
      return;
    }

    const sectionIndex = ONBOARDING_SECTIONS.indexOf(section);
    const nextSection = ONBOARDING_SECTIONS[sectionIndex + 1];
    setOpenSections(nextSection ? [nextSection] : []);
    bumpFormVersion();
  }

  function handleFinish() {
    setSubmitError("");
    const values = form.getValues();
    const result = validateOnboardingForm(form, values, openSections);

    if (!result.ok) {
      setOpenSections(result.openSections);
      return;
    }

    void submit(result.payload);
  }

  async function submit(payload: OnboardingPayload) {
    setSubmitting(true);
    try {
      await completeOnboarding(payload);
      navigate("/main");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : ERRORS.submitFailed,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBack() {
    setSubmitError("");
    setLeaving(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setLeaving(false);
    }
  }

  async function handleSkip() {
    setSubmitError("");
    setSkipping(true);
    try {
      await skipOnboarding();
      navigate("/main");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : ERRORS.skipFailed,
      );
    } finally {
      setSkipping(false);
    }
  }

  function bumpFormVersion() {
    setFormVersion((version) => version + 1);
  }

  const values = form.getValues();
  void formVersion;

  return {
    user,
    form,
    values,
    openSections,
    setOpenSections,
    submitting,
    skipping,
    leaving,
    submitError,
    handleFinish,
    handleContinue,
    handleBack,
    handleSkip,
    bumpFormVersion,
    makeAvailableCash,
    makeIncome,
    makeExpense,
    makeGoal,
    makeInvestment,
    makeFutureMoney,
    categories,
    refreshCategories,
  };
}
