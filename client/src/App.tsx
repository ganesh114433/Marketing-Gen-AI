import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";

// Page components
import Dashboard from "@/pages/dashboard";
import ContentCalendar from "@/pages/content-calendar";
import AiContentGenerator from "@/pages/ai-content-generator";
import AiImageGenerator from "@/pages/ai-image-generator";
import Analytics from "@/pages/analytics";
import GoogleAds from "@/pages/google-ads";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// App Layout Component that includes the sidebar and main content
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      )} />
      <Route path="/content-calendar" component={() => (
        <AppLayout>
          <ContentCalendar />
        </AppLayout>
      )} />
      <Route path="/ai-content-generator" component={() => (
        <AppLayout>
          <AiContentGenerator />
        </AppLayout>
      )} />
      <Route path="/ai-image-generator" component={() => (
        <AppLayout>
          <AiImageGenerator />
        </AppLayout>
      )} />
      <Route path="/analytics" component={() => (
        <AppLayout>
          <Analytics />
        </AppLayout>
      )} />
      <Route path="/google-ads" component={() => (
        <AppLayout>
          <GoogleAds />
        </AppLayout>
      )} />
      <Route path="/settings" component={() => (
        <AppLayout>
          <Settings />
        </AppLayout>
      )} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
