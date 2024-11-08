import CldImage from "@/components/shared/cld-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_IMAGE_TYPES } from "@/config/shared.config";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { action } from "@/routes/_home/profile/$username/_layout";
import { profileEditSchema, ProfileEditSchema } from "@/schemas/profile/profile-edit.schema";
import { BaseProfile } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { EditIcon, ImagePlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

export default function ProfileEditDialog({
  name,
  bio,
  avatar,
}: Pick<BaseProfile, "name" | "bio" | "avatar">) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const form = useForm<ProfileEditSchema>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name,
      bio: bio ?? "",
      avatar: undefined,
    },
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null | undefined>(undefined);

  const uploaderRef = useRef<HTMLInputElement | null>(null);
  const handleUploadClick = () => {
    uploaderRef.current?.click();
  };

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      form.setValue("avatar", files[0]);
      setAvatarPreview(URL.createObjectURL(files[0]));
    }
  };

  const handleRemoveAvatar = () => {
    form.setValue("avatar", new File([], "avatar"), { shouldValidate: true });
    setAvatarPreview(null);
  };

  const onSubmit: SubmitHandler<ProfileEditSchema> = (data, event) => {
    submit({ ...data, _action: "update-profile" } as any, {
      method: "PUT",
      action: "/settings/account",
      encType: data.avatar ? "multipart/form-data" : undefined,
    });
  };
  const onError: SubmitErrorHandler<ProfileEditSchema> = (error) =>
    toast({ variant: "primary", title: Object.values(error)[0].message });

  useEffect(() => {
    if (navigation.state !== "idle" || !actionData || actionData._action !== "update-profile") {
      return;
    }

    if (actionData.message) {
      toast({
        variant: "primary",
        title: actionData.message,
      });
    } else {
      toast({
        variant: "primary",
        title: "Profile updated",
      });
      setOpen(false);
    }
  }, [navigation.state, actionData, toast]);

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <DropdownMenu>
          <Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-inactive hover:text-primary"
            >
              <EditIcon className="w-6 h-6" />
            </Button>
          </Trigger>
          <Content className="responsive-dialog-content">
            <Header className="max-md:text-left">
              <Title>
                <VisuallyHidden>Edit Profile</VisuallyHidden>
              </Title>
              <Description />
            </Header>
            <FormProvider {...form}>
              <Form
                className="max-md:pb-4 flex flex-col gap-4 max-md:flex-1 max-md:px-4"
                onSubmit={form.handleSubmit(onSubmit, onError)}
              >
                <div className="flex-between gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1 border-b">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="masked-input"
                            placeholder="Enter your name"
                            autoCapitalize="off"
                            autoComplete="off"
                            autoCorrect="off"
                            autoFocus={false}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field: { name } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            ref={uploaderRef}
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            name={name}
                            onChange={handleUploadAvatar}
                            className="hidden"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DropdownMenuTrigger
                    type="button"
                    className={cn(
                      "flex-center rounded-full overflow-hidden w-20 h-20 hover:bg-muted",
                      avatarPreview || (avatarPreview === undefined && avatar)
                        ? ""
                        : "border border-dashed"
                    )}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : avatarPreview === undefined && avatar ? (
                      <CldImage
                        src={avatar}
                        alt="avatar"
                        responsive={[{ size: { width: 96, height: 96 } }]}
                        dprVariants={[1, 3, 5]}
                        placeholder="blur"
                      />
                    ) : (
                      <ImagePlusIcon className="text-inactive" />
                    )}
                  </DropdownMenuTrigger>
                </div>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field: { ref, ...rest } }) => (
                    <FormItem className="border-b">
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...rest}
                          placeholder="Enter your bio"
                          className="masked-input resize-none !min-h-fit"
                          minRows={1}
                          autoSize
                          maxRows={8}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className={cn(
                    "mt-6 h-14 rounded-xl",
                    !form.formState.isValid && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Save
                </Button>
              </Form>
            </FormProvider>
          </Content>
          <DropdownMenuContent className="w-60 p-2 font-medium">
            <DropdownMenuItem className="p-3" onClick={handleUploadClick}>
              Upload new avatar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="p-3 text-destructive hover:!text-destructive"
              onClick={handleRemoveAvatar}
            >
              Remove current avatar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ResponsiveDialog>
  );
}
