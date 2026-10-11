import * as React from "react";
import { HeadContent, Scripts, Outlet, createRootRoute } from "@tanstack/react-router";
import "../styles/app.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: "Human-friendly historical and political presence map." }
    ],
    title: "Historical Political Presence Map"
  }),
  component: Root,
});

function Root() {
  return <html lang="en"><head><HeadContent /></head><body><Outlet /><Scripts /></body></html>;
}