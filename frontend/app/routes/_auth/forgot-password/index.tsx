import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { sendPasswordResetEmail } from "@/service/.server/email/password-reset.service";
import { setPasswordResetSession } from "@/session/auth-session.server";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, redirect, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const isValid = Boolean(identifier);

  useEffect(() => {
    if (!actionData?.message || navigation.state !== "idle") return;

    toast({ variant: "primary", title: actionData.message });
  }, [actionData, navigation.state, toast]);

  return (
    <Form className="p-6 w-full max-w-sm sm:max-w-[420px] flex flex-col space-y-4" method="post">
      <div className="text-center">
        <p className="font-semibold">Trouble with logging in?</p>
        <p className="font-light text-sm">
          Enter your email address or username, and we&apos;ll send you a code to get back into your
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
        <span className={cn(!isValid && "opacity-50")}>Send</span>
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const identifier = formData.get("identifier");

  // If the user didn't enter their email or username, show an error
  if (!identifier) {
    return json({ message: "Please enter your email or username." }, { status: 400 });
  }

  // Make a request to the server to send a password reset email
  const response = await fetch(envConfig.API_URL + "/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  // If the server responded with an error, show an error
  if (!response.ok) {
    return json({ message: "Unable to reset password. Please try again later." }, { status: 400 });
  }

  // If the server responded with a success, send a password reset email
  const { email, token, code, expiresAt } = await response.json();
  await sendPasswordResetEmail(email, code);

  const headers = new Headers();
  const cookie = await setPasswordResetSession(token, new Date(expiresAt));
  headers.append("Set-Cookie", cookie);

  return redirect("/reset-password/verify-email", { headers });
}
