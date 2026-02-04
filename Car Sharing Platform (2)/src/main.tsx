
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
import { ArrowUpRight } from "lucide-react";
import { AuthProvider } from "./context/AuthContext.jsx";

  createRoot(document.getElementById("root")!).render(<AuthProvider><App /></AuthProvider>);
  