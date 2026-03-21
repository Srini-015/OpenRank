import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { LogoMark } from "./components/Icons";
import { logoutSession } from "./services/auth";
import {
  deleteAccount,
  fetchSettings,
  updateGitHubConnection,
  updatePreferenceSettings,
  updateProfileSettings,
} from "./services/settings";
import { getAppHref, redirectTo } from "./lib/routes";

const THEME_KEY = "openrank-theme";
const EMPTY_SETTINGS = {
  id: "",
  username: "",
  displayName: "",
  avatar: "",
  email: "",
  profileUrl: "",
  bio: "",
  location: "",
  preferences: {
    theme: "dark",
    emailNotifications: true,
    weeklyDigest: true,
    liveUpdates: true,
  },
  integrations: {
    githubConnected: true,
    disconnectedAt: null,
  },
};

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

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M15 6.5 9.5 12 15 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5.5 4.5h10l3 3v11A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 7 5h7M9 4.5v5h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M10 14 8 16a3 3 0 1 0 4.24 4.24l2.23-2.24M14 10l2-2A3 3 0 1 0 11.76 3.76L9.53 6M8.5 15.5l7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4.5 7.5h15M9.5 4.5h5M8 7.5v10.5m8-10.5v10.5M6 7.5l.8 11.1A1.5 1.5 0 0 0 8.3 20h7.4a1.5 1.5 0 0 0 1.5-1.4L18 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4.5 6.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5Zm0 1 7.5 5 7.5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsCard({ children, className = "", delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline = false,
  maxLength,
}) {
  const className =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20";

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={5}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${className} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
        />
      )}
    </label>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-950/40">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
          checked
            ? "bg-slate-950 dark:bg-white"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition dark:bg-slate-950 ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

function ThemeChoice({ label, description, value, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-[1.5rem] border p-4 text-left transition ${
        selected
          ? "border-transparent bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950"
          : "border-slate-200 bg-slate-50/80 text-slate-700 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-white/10"
      }`}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p
        className={`mt-2 text-sm ${
          selected
            ? "text-white/75 dark:text-slate-700"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

export default function Settings() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
    bio: "",
    location: "",
  });
  const [preferenceForm, setPreferenceForm] = useState(
    EMPTY_SETTINGS.preferences,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [githubPending, setGitHubPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const applySettings = (nextSettings) => {
    const merged = {
      ...EMPTY_SETTINGS,
      ...nextSettings,
      preferences: {
        ...EMPTY_SETTINGS.preferences,
        ...nextSettings?.preferences,
      },
      integrations: {
        ...EMPTY_SETTINGS.integrations,
        ...nextSettings?.integrations,
      },
    };

    setSettings(merged);
    setProfileForm({
      displayName: merged.displayName || "",
      email: merged.email || "",
      bio: merged.bio || "",
      location: merged.location || "",
    });
    setPreferenceForm(merged.preferences);
    setTheme(merged.preferences.theme || "dark");
  };

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchSettings();

        if (!ignore) {
          applySettings(response.settings || EMPTY_SETTINGS);
          setNotice(null);
        }
      } catch (requestError) {
        if (ignore) {
          return;
        }

        if (requestError?.response?.status === 401) {
          redirectTo("/login");
          return;
        }

        setError("Unable to load your settings right now.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  const profileDirty = useMemo(
    () =>
      profileForm.displayName !== (settings.displayName || "") ||
      profileForm.email !== (settings.email || "") ||
      profileForm.bio !== (settings.bio || "") ||
      profileForm.location !== (settings.location || ""),
    [profileForm, settings],
  );

  const preferencesDirty = useMemo(
    () =>
      preferenceForm.theme !== settings.preferences.theme ||
      preferenceForm.emailNotifications !==
        settings.preferences.emailNotifications ||
      preferenceForm.weeklyDigest !== settings.preferences.weeklyDigest ||
      preferenceForm.liveUpdates !== settings.preferences.liveUpdates,
    [preferenceForm, settings.preferences],
  );

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (profileSaving || !profileDirty) {
      return;
    }

    setProfileSaving(true);
    setNotice(null);

    try {
      const response = await updateProfileSettings(profileForm);
      applySettings(response.settings || EMPTY_SETTINGS);
      setError("");
      setNotice({
        type: "success",
        message: "Profile settings saved.",
      });
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        redirectTo("/login");
        return;
      }

      setNotice({
        type: "error",
        message: "Unable to save profile settings.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePreferencesSave = async (event) => {
    event.preventDefault();

    if (preferencesSaving || !preferencesDirty) {
      return;
    }

    setPreferencesSaving(true);
    setNotice(null);

    try {
      const response = await updatePreferenceSettings(preferenceForm);
      applySettings(response.settings || EMPTY_SETTINGS);
      setError("");
      setNotice({
        type: "success",
        message: "Preferences updated across your account.",
      });
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        redirectTo("/login");
        return;
      }

      setNotice({
        type: "error",
        message: "Unable to update preferences right now.",
      });
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handleGitHubToggle = async () => {
    if (githubPending) {
      return;
    }

    const nextConnected = !settings.integrations.githubConnected;
    setGitHubPending(true);
    setNotice(null);

    try {
      const response = await updateGitHubConnection(nextConnected);
      applySettings(response.settings || EMPTY_SETTINGS);
      setError("");
      setNotice({
        type: "success",
        message: nextConnected
          ? "GitHub integration marked as connected."
          : "GitHub integration marked as disconnected.",
      });
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        redirectTo("/login");
        return;
      }

      setNotice({
        type: "error",
        message: "Unable to update GitHub connection status.",
      });
    } finally {
      setGitHubPending(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deletePending) {
      return;
    }

    const confirmed = window.confirm(
      "Delete your account permanently? This removes your profile, leaderboard state, notifications, and saved settings.",
    );

    if (!confirmed) {
      return;
    }

    setDeletePending(true);
    setNotice(null);

    try {
      await deleteAccount();
      redirectTo("/login");
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        redirectTo("/login");
        return;
      }

      setNotice({
        type: "error",
        message: "Unable to delete your account right now.",
      });
      setDeletePending(false);
    }
  };

  const handleLogout = async () => {
    if (logoutPending) {
      return;
    }

    setLogoutPending(true);

    try {
      await logoutSession();
    } catch (logoutError) {
      console.error("Logout failed", logoutError);
    } finally {
      redirectTo("/login");
    }
  };

  const pageClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white transition-colors duration-300"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900 transition-colors duration-300";
  const initials = (settings.username || "OR").slice(0, 2).toUpperCase();
  const githubConnected = settings.integrations.githubConnected;
  const noticeClassName =
    notice?.type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200";

  return (
    <div className={pageClassName}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <a
              href={getAppHref("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <ArrowLeftIcon />
              Dashboard
            </a>

            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <LogoMark className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
                  Account Controls
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Profile, preferences, and connection state
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Theme preview: {theme === "dark" ? "Dark" : "Light"}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutPending}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              {logoutPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-500">
            Settings
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Manage your OpenRank account
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            Update your public profile, preview appearance changes instantly,
            control notification preferences, and manage the GitHub connection
            flag stored on your account.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${noticeClassName}`}
          >
            {notice.message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <SettingsCard delay={0.04}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  {settings.avatar ? (
                    <img
                      src={settings.avatar}
                      alt={`${settings.username} avatar`}
                      className="h-20 w-20 rounded-[1.75rem] object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-cyan-500 via-sky-500 to-emerald-400 text-xl font-semibold text-white">
                      {initials}
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
                      Signed in as
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {settings.displayName || settings.username || "OpenRank user"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      @{settings.username || "username"}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    githubConnected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  }`}
                >
                  {githubConnected ? "GitHub connected" : "GitHub disconnected"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <MailIcon />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Email
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-900 dark:text-white">
                    {settings.email || "No email saved"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <LocationIcon />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Location
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-900 dark:text-white">
                    {settings.location || "No location added"}
                  </p>
                </div>
              </div>

              {settings.profileUrl ? (
                <a
                  href={settings.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <LinkIcon />
                  View GitHub profile
                </a>
              ) : null}
            </SettingsCard>

            <SettingsCard delay={0.08}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
                    Integration
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    GitHub connection
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    This saved flag controls whether your account treats GitHub
                    syncing as active. Signing in with GitHub marks it connected
                    again automatically.
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {githubConnected ? "Active" : "Paused"}
                </span>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-950/40">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Last disconnected
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {githubConnected
                    ? "Your GitHub integration is currently active."
                    : formatDate(settings.integrations.disconnectedAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGitHubToggle}
                disabled={githubPending || loading}
                className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  githubConnected
                    ? "border border-amber-200 bg-amber-50 text-amber-700 hover:-translate-y-0.5 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                }`}
              >
                <LinkIcon />
                {githubPending
                  ? "Updating..."
                  : githubConnected
                    ? "Disconnect GitHub"
                    : "Reconnect GitHub"}
              </button>
            </SettingsCard>

            <SettingsCard
              className="border-rose-200/70 dark:border-rose-500/20"
              delay={0.12}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
                Danger Zone
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Delete account
              </h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                This permanently removes your profile, leaderboard history,
                notification state, and saved preferences from MongoDB.
              </p>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletePending || loading}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
              >
                <TrashIcon />
                {deletePending ? "Deleting..." : "Delete account"}
              </button>
            </SettingsCard>
          </div>

          <div className="space-y-6">
            <SettingsCard delay={0.06}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
                    Profile
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Public account info
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Keep your OpenRank profile clean and make sure exported
                    leaderboards and account views show the right identity.
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {profileDirty ? "Unsaved changes" : "Synced"}
                </span>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleProfileSave}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Display name"
                    value={profileForm.displayName}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        displayName: event.target.value,
                      }))
                    }
                    placeholder="How your name should appear"
                    maxLength={80}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="name@example.com"
                    maxLength={160}
                  />
                </div>

                <Field
                  label="Location"
                  value={profileForm.location}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="City, country, or remote"
                  maxLength={120}
                />

                <Field
                  label="Bio"
                  value={profileForm.bio}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  placeholder="Tell people what you build and care about."
                  multiline
                  maxLength={280}
                />

                <button
                  type="submit"
                  disabled={profileSaving || loading || !profileDirty}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <SaveIcon />
                  {profileSaving ? "Saving..." : "Save profile"}
                </button>
              </form>
            </SettingsCard>

            <SettingsCard delay={0.1}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
                    Preferences
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Appearance and updates
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Preview the theme instantly, then save your current draft to
                    keep it in MongoDB with the rest of your preferences.
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {preferencesDirty ? "Draft ready" : "Saved"}
                </span>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handlePreferencesSave}>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Theme mode
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <ThemeChoice
                      label="Dark mode"
                      description="High-contrast gradient surfaces for the analytics-heavy app shell."
                      value="dark"
                      selected={preferenceForm.theme === "dark"}
                      onSelect={(value) => {
                        setPreferenceForm((current) => ({
                          ...current,
                          theme: value,
                        }));
                        setTheme(value);
                      }}
                    />
                    <ThemeChoice
                      label="Light mode"
                      description="Brighter cards and neutral canvas tones for daytime review sessions."
                      value="light"
                      selected={preferenceForm.theme === "light"}
                      onSelect={(value) => {
                        setPreferenceForm((current) => ({
                          ...current,
                          theme: value,
                        }));
                        setTheme(value);
                      }}
                    />
                  </div>
                </div>

                <ToggleRow
                  label="Email notifications"
                  hint="Keep notification-related email delivery enabled for this account."
                  checked={preferenceForm.emailNotifications}
                  onChange={() =>
                    setPreferenceForm((current) => ({
                      ...current,
                      emailNotifications: !current.emailNotifications,
                    }))
                  }
                />

                <ToggleRow
                  label="Weekly digest"
                  hint="Store whether you want weekly summary rollups enabled."
                  checked={preferenceForm.weeklyDigest}
                  onChange={() =>
                    setPreferenceForm((current) => ({
                      ...current,
                      weeklyDigest: !current.weeklyDigest,
                    }))
                  }
                />

                <ToggleRow
                  label="Live updates"
                  hint="Keep real-time dashboard and notification refresh preferences active."
                  checked={preferenceForm.liveUpdates}
                  onChange={() =>
                    setPreferenceForm((current) => ({
                      ...current,
                      liveUpdates: !current.liveUpdates,
                    }))
                  }
                />

                <button
                  type="submit"
                  disabled={preferencesSaving || loading || !preferencesDirty}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <SaveIcon />
                  {preferencesSaving ? "Saving..." : "Save preferences"}
                </button>
              </form>
            </SettingsCard>
          </div>
        </div>
      </div>
    </div>
  );
}
