import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
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
import Lessons from "@/pages/Lessons";
import { AIAssistant } from "@/components/AIAssistant";

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
        <Route path="/lessons" component={Lessons} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthPage />
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
