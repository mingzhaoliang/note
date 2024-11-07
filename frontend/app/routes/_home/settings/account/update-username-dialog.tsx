import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import UniqueInput from "@/components/ui/unique-input";
import { useToast } from "@/hooks/use-toast";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { action } from ".";

const UpdateUsernameDialog = ({ username }: { username: string }) => {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const submit = useSubmit();
  const [isValid, setIsValid] = useState(true);

  const checkUsername = useCallback(async (username: string) => {
    const response = await fetch(`/check-identifier?type=username&identifier=${username}`);
    const data = await response.json();
    return data.isValid;
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      formData.set("_action", "update-username");
      submit(formData, { method: "PUT" });
    },
    [submit]
  );

  useEffect(() => {
    if (navigation.state !== "idle" || !actionData || actionData._action !== "update-username") {
      return;
    }

    if (actionData.message) {
      toast({ variant: "primary", title: actionData.message });
    } else {
      toast({ variant: "primary", title: "Username updated" });
      setOpen(false);
    }
  }, [actionData, navigation.state, toast]);

  return (
    <ResponsiveDialog query="(min-width: 768px)" open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <>
          <Trigger className="flex-between my-2">
            <p>Update username</p>
            <ChevronRightIcon />
          </Trigger>
          <Content className="responsive-dialog-content">
            <Header>
              <Title className="mb-2">Update username</Title>
              <Description>Your username is how others will see you on the platform.</Description>
            </Header>
            <Form method="PUT" onSubmit={handleSubmit}>
              <UniqueInput
                name="username"
                placeholder="Enter your username"
                defaultValue={username}
                aria-label="Username"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                required
                className="h-14"
                checkFn={checkUsername}
                checkFnCallback={setIsValid}
              />
              <Button
                type="submit"
                className="w-full mt-4 h-14"
                disabled={navigation.state !== "idle" || !isValid}
              >
                {navigation.state === "submitting" ? "Saving..." : "Save"}
              </Button>
            </Form>
          </Content>
        </>
      )}
    </ResponsiveDialog>
  );
};

export default UpdateUsernameDialog;
