import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes";
import { PublicEnv } from "./components/common/public-env";
import { Toaster } from "./components/ui/toaster";
import envConfig from "./config/env.config.server";
import { themeSessionResolver } from "./session/theme-session.server";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
    ENV: {
      CLOUDINARY_CLOUD_NAME: envConfig.CLOUDINARY_CLOUD_NAME,
    },
  };
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

function Document({ children }: { children: React.ReactNode }) {
  const { theme: ssrTheme, ENV } = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {ssrTheme !== undefined && <PreventFlashOnWrongTheme ssrTheme={Boolean(ssrTheme)} />}
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration
          getKey={(location) => (location.pathname === "/" ? location.pathname : location.key)}
        />
        <PublicEnv {...ENV} />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return (
    <Document>
      <Outlet />
      <Toaster />
    </Document>
  );
}
