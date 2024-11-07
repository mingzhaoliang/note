import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import PasswordInput from "@/components/ui/password-input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { UpdatePasswordSchema, updatePasswordSchema } from "@/schemas/auth/update-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { action } from ".";

const UpdatePasswordDialog = () => {
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    },
  });
  const { isValid } = form.formState;
  const onSubmit: SubmitHandler<UpdatePasswordSchema> = (data) =>
    submit({ ...data, _action: "update-password" }, { method: "PUT" });
  const onError: SubmitErrorHandler<UpdatePasswordSchema> = (error) =>
    toast({ variant: "primary", title: Object.values(error)[0].message });

  useEffect(() => {
    if (navigation.state !== "idle" || !actionData) return;

    if (actionData._action !== "update-password") return;

    if (actionData.message) {
      toast({ variant: "primary", title: actionData.message });
    } else {
      form.reset();
      setOpen(false);
    }
  }, [actionData, navigation.state, toast]);

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <>
          <Trigger className="flex-between my-2">
            <p>Update password</p>
            <ChevronRightIcon />
          </Trigger>
          <Content className="!rounded-xl bg-primary-foreground">
            <Header className="">
              <Title>Update password</Title>
              <Description>
                Enter your current and new password to update your password.
              </Description>
            </Header>
            <FormProvider {...form}>
              <Form
                className="flex flex-col gap-y-4"
                onSubmit={form.handleSubmit(onSubmit, onError)}
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PasswordInput placeholder="Current password" className="h-14" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PasswordInput placeholder="New password" className="h-14" {...field} />
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
                        <PasswordInput
                          placeholder="Confirm new password"
                          className="h-14"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className={cn("h-14", !isValid && "cursor-not-allowed hover:bg-primary")}
                >
                  <span className={cn(!isValid && "opacity-50")}>Save</span>
                </Button>
              </Form>
            </FormProvider>
          </Content>
        </>
      )}
    </ResponsiveDialog>
  );
};

export default UpdatePasswordDialog;
