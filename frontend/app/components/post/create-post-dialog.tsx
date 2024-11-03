import PostForm from "@/components/post/post-form/post-form";
import { useState } from "react";
import { ResponsiveDialog, ResponsiveDialogChildren } from "../ui/responsive-dialog";

export default function CreatePostDialog(
  props: React.ComponentPropsWithoutRef<ResponsiveDialogChildren["Trigger"]>
) {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <>
          <Trigger {...props} />
          <Content className="responsive-dialog-content">
            <Header className="max-md:text-left">
              <Title>Create Note</Title>
              <Description>Share your thoughts with the world.</Description>
            </Header>
            <PostForm className="max-md:flex-1 max-md:px-4" setOpen={setOpen} />
          </Content>
        </>
      )}
    </ResponsiveDialog>
  );
}
