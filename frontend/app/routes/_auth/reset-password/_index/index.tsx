import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import PasswordInput from "@/components/ui/password-input";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { resetPasswordSchema, ResetPasswordSchema } from "@/schemas/auth/password-reset.schema";
import { getPasswordResetSessionToken, setAuthSession } from "@/session/auth-session.server";
import { validatePasswordResetSession } from "@/session/guard.server";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunctionArgs,
  HeadersFunction,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

export const headers: HeadersFunction = () => ({
  "Referrer-Policy": "strict-origin",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await validatePasswordResetSession(request);

  if (!session) {
    return redirect("/forgot-password");
  }

  if (!session.emailVerified) {
    return redirect("/reset-password/verify-email");
  }

  return null;
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
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
  const onSubmit: SubmitHandler<ResetPasswordSchema> = (data) => submit(data, { method: "PUT" });
  const onError: SubmitErrorHandler<ResetPasswordSchema> = (error) =>
    toast({ variant: "primary", title: Object.values(error)[0].message });

  useEffect(() => {
    if (!actionData?.message || navigation.state !== "idle") return;
    toast({ variant: "primary", title: actionData.message });
  }, [actionData, navigation.state, toast]);

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

export async function action({ request, params }: ActionFunctionArgs) {
  const token = await getPasswordResetSessionToken(request);

  const formData = await request.formData();

  // Make a POST request to the server to reset the password
  const response = await fetch(`${envConfig.API_URL}/reset-password/${token}`, {
    method: "PUT",
    body: formData,
  });

  // If the server responded with an error, show an error and return a 400 status
  if (!response.ok) {
    const data = await response.json();
    const message = data.message ?? response.statusText;
    return json({ message }, { status: response.status });
  }

  const { sessionToken, expiresAt } = await response.json();
  const authCookie = await setAuthSession(sessionToken, new Date(expiresAt));

  return redirect("/", {
    headers: { "Set-Cookie": authCookie, "Referrer-Policy": "strict-origin" },
  });
}
