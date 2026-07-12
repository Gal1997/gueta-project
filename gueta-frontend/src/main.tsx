import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { DirectionProvider, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DirectionProvider initialDirection="rtl">
      <MantineProvider defaultColorScheme="dark">
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </MantineProvider>
    </DirectionProvider>
  </StrictMode>,
);
