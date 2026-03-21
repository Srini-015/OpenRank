import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import Leaderboard from "./Leaderboard";
import Login from "./Login";
import Notifications from "./Notifications";
import RepositoryDetail from "./RepositoryDetail";
import RepositoryInsights from "./RepositoryInsights";
import Settings from "./Settings";
import Signup from "./Signup";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import DemoPreview from "./components/DemoPreview";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import { getAppPathname } from "./lib/routes";

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

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const pathname = getAppPathname();
  const isRepositoryDetailPage = pathname.startsWith("/repositories/");
  const isStandalonePage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/dashboard" ||
    pathname === "/leaderboard" ||
    pathname === "/notifications" ||
    pathname === "/settings" ||
    pathname === "/repositories" ||
    isRepositoryDetailPage;

  useEffect(() => {
    if (isStandalonePage) {
      return undefined;
    }

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
    return undefined;
  }, [isStandalonePage, theme]);

  if (pathname === "/login") {
    return <Login />;
  }

  if (pathname === "/signup") {
    return <Signup />;
  }

  if (pathname === "/dashboard") {
    return <Dashboard />;
  }

  if (pathname === "/leaderboard") {
    return <Leaderboard />;
  }

  if (pathname === "/notifications") {
    return <Notifications />;
  }

  if (pathname === "/settings") {
    return <Settings />;
  }

  if (pathname === "/repositories") {
    return <RepositoryInsights />;
  }

  if (isRepositoryDetailPage) {
    const repoName = decodeURIComponent(pathname.slice("/repositories/".length));
    return <RepositoryDetail repoName={repoName} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] text-ink-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-hero-grid bg-[size:36px_36px] opacity-40 [mask-image:radial-gradient(circle_at_top,black,transparent_82%)] dark:opacity-20" />
        <Navbar theme={theme} setTheme={setTheme} />
        <main>
          <Hero />
          <Features />
          <DemoPreview />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
