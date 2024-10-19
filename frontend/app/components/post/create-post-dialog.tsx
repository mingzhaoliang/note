import PostForm from "@/components/post/post-form/post-form";
import { useState } from "react";
import { ResponsiveDialog } from "../ui/responsive-dialog";

type CreatePostDialogProps = {
  trigger: React.ReactNode;
};

export default function CreatePostDialog({ trigger }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <>
          <Trigger>{trigger}</Trigger>
          <Content className="max-md:h-[calc(100vh-4rem)] md:!rounded-3xl md:max-w-screen-sm bg-primary-foreground no-highlight">
            <Header className="max-md:text-left">
              <Title>Create Note</Title>
              <Description>Share your thoughts with the world.</Description>
            </Header>
            <PostForm className="max-md:flex-1 max-md:px-4 w-[590px]" setOpen={setOpen} />
          </Content>
        </>
      )}
    </ResponsiveDialog>
  );
}
