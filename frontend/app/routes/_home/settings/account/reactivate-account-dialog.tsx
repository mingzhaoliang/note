import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { action } from ".";

const ReactiveAccountDialog = ({ toBeDeletedAt }: { toBeDeletedAt?: Date }) => {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const submit = useSubmit();
  const [open, setOpen] = useState(false);

  const daysTillDeletion = toBeDeletedAt
    ? Math.ceil((toBeDeletedAt.getTime() - Date.now()) / 1000 / 60 / 60 / 24)
    : undefined;

  const handleReactivate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("_action", "reactivateAccount");
    submit(formData, { method: "PUT" });
  };

  useEffect(() => {
    if (navigation.state !== "idle" || !actionData) return;

    const { actionState } = actionData;

    if (actionState._action !== "reactivateAccount") return;

    if (actionState.message) {
      toast({ variant: "primary", title: actionState.message });
    } else {
      toast({ variant: "primary", title: "You account is activated now." });
      setOpen(false);
    }
  }, [actionData, navigation.state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex-between my-2">
        <p>Reactivate account</p>
        <ChevronRightIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivate account</DialogTitle>
          <DialogDescription>
            Your profile, posts, comments, likes, and followers will be displayed again after
            reactivating your account.
          </DialogDescription>
        </DialogHeader>
        {daysTillDeletion && (
          <div className="text-sm text-destructive">{`Your account will be deleted in ${
            daysTillDeletion > 1 ? daysTillDeletion + " days" : "today"
          }.`}</div>
        )}
        <Form method="PUT" onSubmit={handleReactivate}>
          <Button type="submit" className="w-full mt-4 h-14" disabled={navigation.state !== "idle"}>
            {navigation.state === "submitting" ? "Reactivating..." : "Reactivate"}
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReactiveAccountDialog;
