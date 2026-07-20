import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import { Layout } from "@/components/Layout";
import { useAppStore } from "@/store/useAppStore";

// Pages
import Dashboard from "@/pages/Dashboard";
import Assessment from "@/pages/Assessment";
import Modules from "@/pages/Modules";
import ModuleDetail from "@/pages/ModuleDetail";
import Certificate from "@/pages/Certificate";
import AIEngine from "@/pages/AIEngine";
import Analytics from "@/pages/Analytics";
import AuthPage from "@/pages/AuthPage";
import Assignments from "@/pages/Assignments";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Lessons from "@/pages/Lessons";
import Rankings from "@/pages/Rankings";
import News from "@/pages/News";
import CTF from "@/pages/CTF";
import { AIAssistant } from "@/components/AIAssistant";
import { Spinner } from "@/components/ui/spinner";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/modules" component={Modules} />
        <Route path="/module/:id" component={ModuleDetail} />
        <Route path="/certificate" component={Certificate} />
        <Route path="/ai-engine" component={AIEngine} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/assignments" component={Assignments} />
        <Route path="/students" component={Students} />
        <Route path="/students/:id" component={StudentDetail} />
        <Route path="/lessons" component={Lessons} />
        <Route path="/rankings" component={Rankings} />
        <Route path="/news" component={News} />
        <Route path="/ctf" component={CTF} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const { currentUser, token, verifySession } = useAppStore();
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"Student" | "Teacher">("Student");

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }
    verifySession().finally(() => setIsVerifying(false));
    // Only re-run when the persisted token identity changes, not on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showAuth ? (
            <AuthPage onBack={() => setShowAuth(false)} initialTab={authTab} />
          ) : (
            <Landing
              onGetStarted={(tab) => {
                setAuthTab(tab);
                setShowAuth(true);
              }}
            />
          )}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
          <AIAssistant />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
