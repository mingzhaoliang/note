import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import PasswordInput from "@/components/ui/password-input";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { resetPasswordSchema, ResetPasswordSchema } from "@/schemas/auth/password-reset.schema";
import { setAuthSession } from "@/session/auth-session.server";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunctionArgs,
  HeadersFunction,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();
  const { toast } = useToast();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });
  const { isValid } = form.formState;

  const submit = useSubmit();
  const onSubmit: SubmitHandler<ResetPasswordSchema> = (data) => submit(data, { method: "post" });
  const onError: SubmitErrorHandler<ResetPasswordSchema> = (error) =>
    toast({ variant: "primary", title: Object.values(error)[0].message });

  useEffect(() => {
    if (!loaderData.message) return;
    toast({ variant: "primary", title: loaderData.message });
  }, [loaderData, toast]);

  return (
    <FormProvider {...form}>
      <Form
        className="p-6 w-full max-w-sm sm:max-w-[420px] flex flex-col space-y-4"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <div className="text-center">
          <p className="font-semibold">Reset your password</p>
          <p className="font-light text-sm">Enter your new password below.</p>
        </div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput placeholder="Password" className="h-14" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput placeholder="Confirm password" className="h-14" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn("h-14", !isValid && "cursor-not-allowed hover:bg-primary")}
        >
          <span className={cn(!isValid && "opacity-50")}>Reset Password</span>
        </Button>
      </Form>
    </FormProvider>
  );
}

export const headers: HeadersFunction = () => ({
  "Referrer-Policy": "strict-origin",
});

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);

  const session = await getBaseSession(request.headers.get("Cookie"));
  const message: string | null = session.get("message") || null;

  return json({ message }, { headers: { "Set-Cookie": await commitBaseSession(session) } });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData);
  const { token } = params;

  // Make a POST request to the server to reset the password
  const response = await fetch(envConfig.API_URL + "/auth/reset-password/" + token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // If the server responded with an error, show an error and return a 400 status
  if (!response.ok) {
    const session = await getBaseSession(request.headers.get("Cookie"));
    session.flash("message", "Unable to reset password. Please try again later.");

    return json({}, { status: 400, headers: { "Set-Cookie": await commitBaseSession(session) } });
  }

  const { sessionId } = await response.json();
  const authHeader = await setAuthSession(sessionId);

  return redirect("/", {
    headers: { "Set-Cookie": authHeader, "Referrer-Policy": "strict-origin" },
  });
}
