import { Comment } from "@/components/icons";
import LexicalComposer from "@/components/shared/lexical-composer";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { MAX_COMMENT_LENGTH, WARNING_THRESHOLD } from "@/config/post.config";
import { OnRevalidate, useRevalidatePost } from "@/hooks/use-revalidate-post";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { RevalidatePostStats } from "@/store/redux/features/post-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { Form, useFetcher } from "@remix-run/react";
import { EditorState, LexicalEditor } from "lexical";
import { useCallback, useState } from "react";

type PostCommentProps = {
  commentOnId: string;
  count: number;
};

const CommentButton = ({ commentOnId, count }: PostCommentProps) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const optimisticCount = isSubmitting ? count + 1 : count;

  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isValid = commentText.length > 0 && commentText.length <= MAX_COMMENT_LENGTH;
  const remaining = MAX_COMMENT_LENGTH - commentText.length;
  const shouldShowWarning = remaining <= WARNING_THRESHOLD;

  const handleRevalidate: OnRevalidate = useCallback((updatedPost, actionState) => {
    if (!updatedPost) return;

    dispatch(RevalidatePostStats({ updatedPost, postId: actionState.postId }));
  }, []);

  useRevalidatePost(fetcher, handleRevalidate);

  const handleEditorChange = (editorState: EditorState, editor: LexicalEditor) => {
    const textContent = editor.getRootElement()?.textContent;
    setCommentText(textContent || "");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if the comment is valid
    if (!isValid) {
      toast({
        variant: "primary",
        title: `Comment should be at most ${MAX_COMMENT_LENGTH} characters.`,
      });
      return;
    }

    // Submit the comment to the server
    fetcher.submit(
      { commentOnId, text: commentText },
      { method: "POST", action: `/api/post/${commentOnId}/comment` }
    );

    setCommentText("");
    setOpen(false);
  };

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Trigger, Content, Header, Title, Description }) => (
        <>
          <Trigger asChild>
            <Button
              variant="ghost"
              className="rounded-full space-x-2 px-3"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <Comment className="text-inactive w-5 h-5" />
              {optimisticCount > 0 && <p className="text-inactive text-sm">{optimisticCount}</p>}
            </Button>
          </Trigger>
          <Content
            className="responsive-dialog-content pb-6"
            overlayConfig={{ onClick: (e) => e.stopPropagation() }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header className="max-md:text-left">
              <Title>Comment</Title>
              <Description>Leave a comment below</Description>
            </Header>
            <fetcher.Form
              onSubmit={handleSubmit}
              className="max-md:flex-1 flex flex-col max-md:px-4"
            >
              <div className="relative flex-1">
                <LexicalComposer>
                  <PlainTextPlugin
                    contentEditable={
                      <ContentEditable
                        className="editor-input"
                        aria-placeholder="Write a comment..."
                        placeholder={<div className="editor-placeholder">Write a comment...</div>}
                        autoFocus
                      />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                  <OnChangePlugin onChange={handleEditorChange} />
                </LexicalComposer>
              </div>
              <div className="flex-between">
                <p className={cn("text-inactive text-sm", remaining < 0 && "text-destructive")}>
                  {shouldShowWarning && remaining}
                </p>
                <Button disabled={!isValid} variant="outline" type="submit" className="rounded-xl">
                  Post
                </Button>
              </div>
            </fetcher.Form>
          </Content>
        </>
      )}
    </ResponsiveDialog>
  );
};

export default CommentButton;
