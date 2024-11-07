import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";
import { action } from ".";

const deactivateWarning =
  "Your profile, posts, comments, likes, and followers will not be visible to anyone until you reactivate your account.";

const deleteWarning =
  "Your profile, posts, comments, likes, and followers will be hidden before being permanently deleted in 30 days.";

const DeactivateAccountDialog = () => {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const submit = useSubmit();
  const [dialogOpen, setDialogOpen] = useImmer<{ type: "menu" | "delete"; state: boolean }>({
    type: "menu",
    state: false,
  });
  const isDelete = dialogOpen["type"] === "delete";

  const handleType = useCallback((type: "menu" | "delete") => {
    setDialogOpen((draft) => {
      draft.type = type;
    });
  }, []);

  const handleOpen = useCallback((open: boolean) => {
    setDialogOpen((draft) => {
      draft.state = open;
    });
  }, []);

  const alertDeactivate = () => {
    handleOpen(false);
  };

  const alertDelete = () => {
    handleOpen(false);
    handleType("delete");
  };

  const handleDeactivateAccount = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    submit({ _action: "deactivate-account" }, { method: "PUT" });
  };

  const handleDeleteAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const confirm = formData.get("confirm");
    if (confirm !== "Delete my account") {
      toast({
        variant: "primary",
        title: "You must type 'Delete my account' to confirm",
      });
      return;
    }

    formData.set("_action", "delete-account");
    submit(formData, { method: "PUT" });
  };

  useEffect(() => {
    if (
      navigation.state !== "idle" ||
      !actionData ||
      !["delete-account", "deactivate-account"].some((action) => actionData._action === action)
    ) {
      return;
    }

    if (actionData.message) {
      toast({ variant: "primary", title: actionData.message });
    } else {
      toast({
        variant: "primary",
        title: "Your account has been deactivated now.",
        description: "It will be deleted in 30 days. You can re-activate it at any time.",
      });
      handleOpen(false);
    }
  }, [actionData, navigation.state, toast]);

  return (
    <ResponsiveDialog
      query="(min-width: 768px)"
      open={dialogOpen["state"]}
      onOpenChange={handleOpen}
    >
      {({ Header, Title, Content, Description, Trigger }) => (
        <AlertDialog>
          <Trigger className="flex-between my-2" onClick={() => handleType("menu")}>
            <p>Deactivate or delete account</p>
            <ChevronRightIcon />
          </Trigger>
          {dialogOpen["type"] === "menu" && (
            <Content className="responsive-dialog-content">
              <Header className="mb-2">
                <Title>Deactivate or delete</Title>
                <VisuallyHidden>
                  <Description />
                </VisuallyHidden>
              </Header>
              <div className="mb-4 space-y-4">
                <div>
                  <p className="font-medium mb-2">Deactivating your account is temporary.</p>
                  <p className="text-sm text-inactive">{deactivateWarning}</p>
                </div>
                <div>
                  <p className="font-medium mb-2">Deleting your account is permanent.</p>
                  <p className="text-sm text-inactive">{deleteWarning} </p>
                </div>
              </div>
              <AlertDialogTrigger onClick={alertDeactivate} asChild>
                <Button className="h-14">Deactivate account</Button>
              </AlertDialogTrigger>
              <AlertDialogTrigger onClick={alertDelete} asChild>
                <Button variant="outline" className="h-14 text-destructive">
                  Delete account
                </Button>
              </AlertDialogTrigger>
            </Content>
          )}
          {dialogOpen["type"] === "delete" && (
            <Content className="responsive-dialog-content">
              <Header>
                <Title>Delete account</Title>
                <Description>
                  Type <span className="text-destructive font-medium">Delete my account</span> below
                  to confirm that you want to delete your account.
                </Description>
              </Header>
              <Form method="PUT" onSubmit={handleDeleteAccount}>
                <Input name="confirm" placeholder="Delete my account" className="h-14" />
                <Button
                  type="submit"
                  className="w-full mt-4 h-14"
                  disabled={navigation.state !== "idle"}
                >
                  {navigation.state === "submitting" ? "Deleting..." : "Delete"}
                </Button>
              </Form>
            </Content>
          )}
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure to {isDelete ? "delete" : "deactivate"} your account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isDelete ? deleteWarning : deactivateWarning}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {isDelete ? (
                <Trigger onClick={() => handleType("delete")} asChild>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </Trigger>
              ) : (
                <AlertDialogAction
                  disabled={navigation.state !== "idle"}
                  onClick={handleDeactivateAccount}
                >
                  {navigation.state === "submitting" ? "Deactivating..." : "Deactivate"}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ResponsiveDialog>
  );
};

export default DeactivateAccountDialog;
