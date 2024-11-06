import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import envConfig from "@/config/env.config.server";
import { useToast } from "@/hooks/use-toast";
import { getPasswordResetSessionToken } from "@/session/auth-session.server";
import { validatePasswordResetSession } from "@/session/guard.server";
import { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect } from "react";

export const headers: HeadersFunction = () => ({
  "Referrer-Policy": "strict-origin",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await validatePasswordResetSession(request);

  if (!session) {
    return json({ session: null }, { status: 401 });
  }

  return json({ session }, { status: 200 });
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();

  useEffect(() => {
    if (navigation.state !== "idle" || !actionData) return;

    if (actionData.message) {
      toast({
        variant: "primary",
        title: actionData.message,
      });
    }
  }, [navigation.state]);

  return (
    <Form className="w-full max-w-sm sm:max-w-[420px] flex flex-col space-y-4" method="PUT">
      <div className="text-center space-y-2">
        <p className="font-semibold">Verify your email</p>
        <p className="font-light text-sm">We sent an 8-digit code to {session?.email}.</p>
      </div>
      <Input type="text" name="code" placeholder="Enter the code" className="h-14" />
      <Button type="submit" className="h-14">
        Verify
      </Button>
    </Form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await getPasswordResetSessionToken(request);

  const formData = await request.formData();

  const res = await fetch(`${envConfig.API_URL}/auth/reset-password/${token}/verify-email`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    let message;

    if (res.status === 400) {
      message = (await res.json()).message || res.statusText;
    } else {
      message = res.statusText;
    }
    return json({ message }, { status: res.status });
  }

  return redirect("/reset-password");
}
