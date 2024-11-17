import PostForm from "@/components/post/post-form/post-form";
import { useToast } from "@/hooks/use-toast";
import { action } from "@/routes/_home/profile/$username_.post/_index";
import { createPost } from "@/store/redux/features/feed-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ResponsiveDialog, ResponsiveDialogChildren } from "../ui/responsive-dialog";

export default function CreatePostDialog(
  props: React.ComponentPropsWithoutRef<ResponsiveDialogChildren["Trigger"]>
) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher<typeof action>({ key: "create-post" });
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.message) {
      toast({
        variant: "primary",
        title: fetcher.data.message,
      });
    } else {
      dispatch(createPost(fetcher.data.data));
      setOpen(false);
    }
  }, [fetcher.state, fetcher.data, dispatch, toast]);

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <>
          <Trigger disabled={fetcher.state !== "idle"} {...props} />
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
