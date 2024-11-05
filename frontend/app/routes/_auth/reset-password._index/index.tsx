import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { sendPasswordResetToken } from "@/service/.server/email/password-reset.service";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function ResetPasswordRequest() {
  const loaderData = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const isValid = Boolean(identifier);

  useEffect(() => {
    if (!loaderData.message) return;
    toast({ variant: "primary", title: loaderData.message });
  }, [loaderData, toast]);

  return (
    <Form className="p-6 w-full max-w-sm sm:max-w-[420px] flex flex-col space-y-4" method="post">
      <div className="text-center">
        <p className="font-semibold">Trouble with logging in?</p>
        <p className="font-light text-sm">
          Enter your email address or username, and we&apos;ll send you a link to get back into your
          account.
        </p>
      </div>
      <Input
        onChange={(e) => setIdentifier(e.target.value)}
        name="identifier"
        placeholder="Email or username"
        className="h-14"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Email or username"
      />
      <Button
        type="submit"
        className={cn("h-14", !isValid && "cursor-not-allowed hover:bg-primary")}
      >
        <span className={cn(!isValid && "opacity-50")}>Send login link</span>
      </Button>
      <SeparatorWithText text="or" />
      <Button type="button" variant="outline" className="h-fit min-h-14" asChild>
        <Link to="/signup">Create new account</Link>
      </Button>
      <Button type="button" variant="outline" className="h-fit min-h-14" asChild>
        <Link to="/login">Back to Login</Link>
      </Button>
    </Form>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);

  const session = await getBaseSession(request.headers.get("Cookie"));
  const message: string | null = session.get("message") || null;

  return json({ message }, { headers: { "Set-Cookie": await commitBaseSession(session) } });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getBaseSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const identifier = formData.get("identifier");

  // If the user didn't enter their email or username, show an error
  if (!identifier) {
    session.flash("message", "Please enter your email or username.");
    return json({}, { status: 400, headers: { "Set-Cookie": await commitBaseSession(session) } });
  }

  // Make a request to the server to send a password reset email
  const response = await fetch(envConfig.API_URL + "/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  // If the server responded with an error, show an error
  if (!response.ok) {
    session.flash("message", "Unable to reset password. Please try again later.");
    return json({}, { status: 400, headers: { "Set-Cookie": await commitBaseSession(session) } });
  }

  // If the server responded with a success, send a password reset email
  const { email, verificationToken } = await response.json();
  const verificationLink = `${envConfig.APP_URL}/reset-password/${verificationToken}`;
  await sendPasswordResetToken(email, verificationLink);

  session.flash("message", "Password reset email sent.");
  return json({}, { status: 200, headers: { "Set-Cookie": await commitBaseSession(session) } });
}
