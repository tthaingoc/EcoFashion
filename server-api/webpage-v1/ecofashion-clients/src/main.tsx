import { createRoot } from "react-dom/client";
import './assets/css/style.css';
import './assets/css/dashboard.css';
import './assets/css/stylist.css';
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
