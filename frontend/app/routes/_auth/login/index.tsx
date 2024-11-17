import GoogleButton from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { loginSchema, LoginSchema } from "@/schemas/auth/login.schema";
import { setAuthSession } from "@/session/auth-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);
  return null;
}

export default function Index() {
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const { isValid } = form.formState;

  const submit = useSubmit();
  const onSubmit: SubmitHandler<LoginSchema> = (data) => submit(data, { method: "POST" });
  const onError: SubmitErrorHandler<LoginSchema> = (error) =>
    toast({ variant: "primary", title: Object.values(error)[0].message });

  useEffect(() => {
    if (!actionData?.message || navigation.state !== "idle") return;
    toast({ variant: "primary", title: actionData.message });
  }, [actionData, navigation.state, toast]);

  return (
    <FormProvider {...form}>
      <Form
        className="w-full max-w-sm sm:max-w-[420px] flex flex-col space-y-4"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <p className="font-semibold text-center">Log in to your account</p>
        <div className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email or username"
                    className="h-14"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-label="Email or username"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
          <Button
            type="submit"
            className={cn("h-14", !isValid && "cursor-not-allowed hover:bg-primary")}
          >
            <span className={cn(!isValid && "opacity-50")}>Log in</span>
          </Button>
        </div>
        <Link
          to="/forgot-password"
          className="self-center text-sm text-muted-foreground font-light"
        >
          Forgot password?
        </Link>
        <SeparatorWithText text="or" />
        <GoogleButton />
      </Form>
      <div className="pt-8 flex-1">
        <Link to={`/signup`} replace className="text-sm text-muted-foreground hover:text-primary">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </FormProvider>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData);

  const response = await fetch(envConfig.API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    const message = data.message || response.statusText;
    return json({ message }, { status: 400 });
  }

  const data = await response.json();
  const { sessionToken, expiresAt } = data.data;
  const authCookie = await setAuthSession(sessionToken, new Date(expiresAt));

  return redirect("/", { headers: { "Set-Cookie": authCookie } });
}
