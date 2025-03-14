import { Switch, Route } from "wouter";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import ContentGenerator from "./pages/content-generator";
import ImageGenerator from "./pages/image-generator";
import ContentCalendar from "./pages/content-calendar";
import CampaignAnalytics from "./pages/campaign-analytics";
import GoogleAds from "./pages/google-ads";
import GoogleAnalytics from "./pages/google-analytics";
import NotFound from "@/pages/not-found";

// Mock authenticated user for demo purposes
export const currentUser = {
  id: 1,
  username: "demo",
  fullName: "John Doe",
  email: "john@example.com"
};

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/content-generator" component={ContentGenerator} />
        <Route path="/image-generator" component={ImageGenerator} />
        <Route path="/content-calendar" component={ContentCalendar} />
        <Route path="/campaign-analytics" component={CampaignAnalytics} />
        <Route path="/google-ads" component={GoogleAds} />
        <Route path="/google-analytics" component={GoogleAnalytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
