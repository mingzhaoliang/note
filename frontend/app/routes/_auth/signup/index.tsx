import GoogleButton from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { signupSchema, SignupSchema } from "@/schemas/auth/signup.schema";
import { setAuthSession } from "@/session/auth-session.server";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

export default function SignupForm() {
  const { toast } = useToast();
  const loaderData = useLoaderData<typeof loader>();

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
    },
  });
  const { isValid } = form.formState;

  const submit = useSubmit();
  const onSubmit: SubmitHandler<SignupSchema> = (data) => submit(data, { method: "POST" });
  const onError: SubmitErrorHandler<SignupSchema> = (error) =>
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
        <p className="font-semibold text-center">Create your account</p>
        <div className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Username"
                    className="h-14"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-label="Username"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full name"
                    className="h-14"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-label="Full name"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="h-14"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-label="Email"
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
                  <PasswordInput placeholder="Password" className="h-14" field={field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={cn("h-14", !isValid && "cursor-not-allowed hover:bg-primary")}
          >
            <span className={cn(!isValid && "opacity-50")}>Sign up</span>
          </Button>
        </div>
        <SeparatorWithText text="or" />
        <GoogleButton />
      </Form>
      <div className="p-8 flex-1 flex items-end">
        <Link to={`/login`} replace className="text-sm text-muted-foreground hover:text-primary">
          Already have an account? Log in
        </Link>
      </div>
    </FormProvider>
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
  const payload = Object.fromEntries(formData);

  const response = await fetch(envConfig.API_URL + "/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const { error } = await response.json();
    session.flash("message", error);
    return json({}, { status: 400, headers: { "Set-Cookie": await commitBaseSession(session) } });
  }

  const { sessionId } = await response.json();
  const authHeader = await setAuthSession(sessionId);

  return redirect("/", { headers: { "Set-Cookie": authHeader } });
}