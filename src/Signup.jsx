import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LogoMark, MoonIcon, SunIcon } from "./components/Icons";
import { getAppHref } from "./lib/routes";

const THEME_KEY = "openrank-theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "dark";
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.4c.58.1.79-.25.79-.56v-1.95c-3.18.69-3.85-1.35-3.85-1.35-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.73-1.53-2.54-.29-5.2-1.27-5.2-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.6.23 2.78.11 3.07.74.8 1.18 1.82 1.18 3.07 0 4.4-2.66 5.37-5.2 5.65.41.35.77 1.03.77 2.09v3.1c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2.8 12S6.3 5.5 12 5.5 21.2 12 21.2 12 17.7 18.5 12 18.5 2.8 12 2.8 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 4L20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.8A9.85 9.85 0 0 1 12 5.5c5.7 0 9.2 6.5 9.2 6.5a16.6 16.6 0 0 1-3.2 4.1M6.3 8.3A16.7 16.7 0 0 0 2.8 12s3.5 6.5 9.2 6.5a9.9 9.9 0 0 0 4.2-.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9A3 3 0 0 0 14.1 14.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  const className = isDark
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
    : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={className}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  theme,
  autoComplete,
  rightControl = null,
}) {
  const isDark = theme === "dark";
  const inputClassName = error
    ? isDark
      ? "mt-2 w-full rounded-xl border border-rose-400/70 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition duration-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-500/20"
      : "mt-2 w-full rounded-xl border border-rose-400 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15"
    : isDark
      ? "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition duration-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
      : "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";
  const labelClassName = isDark ? "text-slate-200" : "text-slate-700";
  const errorClassName = isDark ? "text-rose-300" : "text-rose-600";

  return (
    <div>
      <label htmlFor={id} className={`text-sm font-medium ${labelClassName}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClassName} ${rightControl ? "pr-12" : ""}`}
        />
        {rightControl ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightControl}
          </div>
        ) : null}
      </div>
      <div className="min-h-[1.25rem] pt-1">
        {error ? (
          <p id={`${id}-error`} className={`text-xs ${errorClassName}`}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  }

  if (/\d/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return {
      label: "Weak",
      activeBars: Math.max(score, 1),
      barClassName: "bg-rose-400",
      textClassName: "text-rose-400",
    };
  }

  if (score <= 3) {
    return {
      label: "Medium",
      activeBars: score,
      barClassName: "bg-amber-400",
      textClassName: "text-amber-400",
    };
  }

  return {
    label: "Strong",
    activeBars: 4,
    barClassName: "bg-emerald-400",
    textClassName: "text-emerald-400",
  };
}

function validateForm(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Name should be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Please create a password.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function Signup() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isDark = theme === "dark";
  const passwordStrength = useMemo(
    () => getPasswordStrength(values.password),
    [values.password],
  );
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key]),
  );
  const pageClassName = isDark
    ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(71,85,105,0.32),_transparent_36%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white transition-colors duration-300"
    : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(148,163,184,0.28),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900 transition-colors duration-300";
  const cardClassName = isDark
    ? "w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/75 p-8 shadow-xl backdrop-blur-xl md:max-w-md"
    : "w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-xl md:max-w-md";
  const mutedTextClassName = isDark ? "text-slate-400" : "text-slate-500";
  const linkClassName = isDark
    ? "font-medium text-indigo-300 transition hover:text-indigo-200"
    : "font-medium text-indigo-600 transition hover:text-indigo-500";
  const logoShellClassName = isDark
    ? "rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur"
    : "rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur";
  const secondaryButtonClassName = isDark
    ? "flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
    : "flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-900";

  function handleChange(field) {
    return (event) => {
      const nextValues = {
        ...values,
        [field]: event.target.value,
      };

      setValues(nextValues);
      setErrors(validateForm(nextValues));
    };
  }

  function handleBlur(field) {
    return () => {
      setTouched((current) => ({
        ...current,
        [field]: true,
      }));
      setErrors(validateForm(values));
    };
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      setLoading(false);
    }, 1600);
  }

  function renderPasswordToggle() {
    return (
      <button
        type="button"
        onClick={() => setShowPasswords((current) => !current)}
        aria-label={showPasswords ? "Hide password" : "Show password"}
        aria-pressed={showPasswords}
        className={`transition ${mutedTextClassName} hover:text-indigo-400`}
      >
        {showPasswords ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    );
  }

  return (
    <main className={pageClassName}>
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-16 left-8 h-40 w-40 rounded-full bg-slate-500/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme(isDark ? "light" : "dark")}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cardClassName}
        >
          <div className="flex justify-center">
            <div className={logoShellClassName}>
              <LogoMark />
            </div>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Create Your Account
            </h1>
            <p className={`mt-2 text-sm ${mutedTextClassName}`}>
              Start tracking your open-source journey
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <FormField
              id="fullName"
              label="Full Name"
              value={values.fullName}
              onChange={handleChange("fullName")}
              placeholder="Ada Lovelace"
              error={visibleErrors.fullName}
              theme={theme}
              autoComplete="name"
              onBlur={handleBlur("fullName")}
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="you@github.dev"
              error={visibleErrors.email}
              theme={theme}
              autoComplete="email"
              onBlur={handleBlur("email")}
            />

            <div>
              <FormField
                id="password"
                label="Password"
                type={showPasswords ? "text" : "password"}
                value={values.password}
                onChange={handleChange("password")}
                placeholder="Create a secure password"
                error={visibleErrors.password}
                theme={theme}
                autoComplete="new-password"
                rightControl={renderPasswordToggle()}
                onBlur={handleBlur("password")}
              />
              <div className="mt-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-1 gap-2">
                    {[0, 1, 2, 3].map((index) => (
                      <span
                        key={index}
                        className={`h-1.5 flex-1 rounded-full ${
                          index < passwordStrength.activeBars
                            ? passwordStrength.barClassName
                            : isDark
                              ? "bg-white/10"
                              : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium ${passwordStrength.textClassName}`}
                  >
                    {values.password ? passwordStrength.label : "Add a password"}
                  </span>
                </div>
              </div>
            </div>

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type={showPasswords ? "text" : "password"}
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Confirm your password"
              error={visibleErrors.confirmPassword}
              theme={theme}
              autoComplete="new-password"
              rightControl={renderPasswordToggle()}
              onBlur={handleBlur("confirmPassword")}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-300 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Spinner />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            <button type="button" className={secondaryButtonClassName}>
              <GitHubMark />
              Sign up with GitHub
            </button>
          </form>

          <p className={`mt-6 text-center text-sm ${mutedTextClassName}`}>
            Already have an account?{" "}
            <a href={getAppHref("/login")} className={linkClassName}>
              Login
            </a>
          </p>

          <p className={`mt-8 text-center text-xs ${mutedTextClassName}`}>
            &copy; 2026 OpenRank
          </p>
        </motion.div>
      </div>
    </main>
  );
}
