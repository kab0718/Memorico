import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { GlobalStyles } from "./styles/GlobalStyles";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/dates/styles.css";

const el = document.getElementById("root")!;
createRoot(el).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        primaryColor: "blue",
        fontFamily: "var(--rounded-label-font)",
        headings: { fontFamily: "var(--rounded-label-font)", fontWeight: "700" },
      }}
    >
      <GlobalStyles />
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
