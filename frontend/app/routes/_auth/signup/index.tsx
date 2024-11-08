import GoogleButton from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import UniqueInput from "@/components/ui/unique-input";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { signupSchema, SignupSchema } from "@/schemas/auth/signup.schema";
import { setAuthSession } from "@/session/auth-session.server";
import { getBaseSession } from "@/session/base-session.server";
import { redirectIfAuthenticated } from "@/session/guard.server";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);
  return null;
}

export default function Index() {
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isIdentifierValid, setIsIdentifierValid] = useState(false);

  const form = useForm<SignupSchema>({
    mode: "onBlur",
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
    },
  });
  const { isValid } = form.formState;

  const checkUsername = useCallback(async (username: string) => {
    const response = await fetch(`/check-identifier?type=username&identifier=${username}`);
    const data = await response.json();
    return data.isValid;
  }, []);

  const checkEmail = useCallback(async (email: string) => {
    const response = await fetch(`/check-identifier?type=email&identifier=${email}`);
    const data = await response.json();
    return data.isValid;
  }, []);

  const submit = useSubmit();
  const onSubmit: SubmitHandler<SignupSchema> = (data) => submit(data, { method: "POST" });
  const onError: SubmitErrorHandler<SignupSchema> = (error) =>
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
        <p className="font-semibold text-center">Create your account</p>
        <div className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UniqueInput
                    placeholder="Enter your username"
                    aria-label="Username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck="false"
                    className="h-14"
                    checkFn={checkUsername}
                    checkFnCallback={setIsIdentifierValid}
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
                  <PasswordInput placeholder="Password" className="h-14" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className={cn(
              "h-14",
              (!isValid || !isIdentifierValid) && "cursor-not-allowed hover:bg-primary"
            )}
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
    let message;

    if (response.status === 400) {
      const data = await response.json();
      message = data.message || response.statusText;
    } else {
      message = response.statusText;
    }
    return json({ message }, { status: 400 });
  }

  const { sessionToken, expiresAt } = await response.json();
  const authCookie = await setAuthSession(sessionToken, new Date(expiresAt));

  return redirect("/", { headers: { "Set-Cookie": authCookie } });
}
