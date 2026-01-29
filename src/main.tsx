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
        fontFamily: "var(--rounded-label-font)",
        headings: { fontFamily: "var(--rounded-label-font)", fontWeight: "700" },
        primaryColor: "blue",
        colors: {
          blue: [
            "#e6f2ff",
            "#cce0ff",
            "#99c2ff",
            "#66a3ff",
            "#3385ff",
            "#0066ff",
            "#0052cc",
            "#003d99",
            "#002966",
            "#001433",
          ],
        },
      }}
    >
      <GlobalStyles />
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
