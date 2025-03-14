import { Switch, Route, useLocation } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Content from "@/pages/content";
import Images from "@/pages/images";
import Ads from "@/pages/ads";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/calendar">
        {() => (
          <AppLayout>
            <Calendar />
          </AppLayout>
        )}
      </Route>
      <Route path="/content">
        {() => (
          <AppLayout>
            <Content />
          </AppLayout>
        )}
      </Route>
      <Route path="/images">
        {() => (
          <AppLayout>
            <Images />
          </AppLayout>
        )}
      </Route>
      <Route path="/ads">
        {() => (
          <AppLayout>
            <Ads />
          </AppLayout>
        )}
      </Route>
      <Route path="/analytics">
        {() => (
          <AppLayout>
            <Analytics />
          </AppLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <AppLayout>
            <Settings />
          </AppLayout>
        )}
      </Route>
      <Route>
        {() => <NotFound />}
      </Route>
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
