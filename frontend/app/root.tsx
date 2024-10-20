import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { PreventFlashOnWrongTheme, Theme, ThemeProvider, useTheme } from "remix-themes";
import { themeSessionResolver } from "./session/theme-session.server";

import { Toaster } from "./components/ui/toaster";
import "./tailwind.css";
import envConfig from "./config/env.config.server";

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

type DocumentProps = {
  theme?: Theme | null;
  ssrTheme?: boolean;
  ENV?: Record<string, unknown>;
};

function Document({ children, theme, ssrTheme, ENV }: React.PropsWithChildren<DocumentProps>) {
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {ssrTheme !== undefined && <PreventFlashOnWrongTheme ssrTheme={ssrTheme} />}
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration
          getKey={(location) => (location.pathname === "/" ? location.pathname : location.key)}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <Document theme={theme} ssrTheme={Boolean(data.theme)} ENV={data.ENV}>
      <Outlet />
      <Toaster />
    </Document>
  );
}

declare global {
  interface Window {
    ENV: {
      CLOUDINARY_CLOUD_NAME: string;
    };
  }
}
