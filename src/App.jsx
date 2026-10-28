import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import "./App.css";

// TaskFlow is a single page app: there is no login and no server.
// All data is stored in the browser (localStorage).
export default function App() {
  return (
    <>
      <Dashboard />
      <Toaster position="top-right" />
    </>
  );
}
