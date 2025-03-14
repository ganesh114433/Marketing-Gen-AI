import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize app by seeding data
async function initApp() {
  try {
    // Seed the database with initial data when the app starts
    await fetch('/api/seed', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
  
  // Render the app regardless of seeding success
  createRoot(document.getElementById("root")!).render(<App />);
}

initApp();
