import { Comment } from "@/components/icons";
import LexicalComposer from "@/components/shared/lexical-composer";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { loader } from "@/routes/_home/_index";
import { useFeed } from "@/store/feed.context";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import { EditorState, LexicalEditor } from "lexical";
import { useState } from "react";

const MAX_COMMENT_LENGTH = 500;
const WARNING_THRESHOLD = 20;

type PostCommentProps = {
  postId: string;
  parentId?: string;
  count: number;
};

const PostComment = ({ postId, parentId, count }: PostCommentProps) => {
  const fetcher = useFetcher();
  const loaderData = useRouteLoaderData<typeof loader>("/?index");

  const { setPosts } = useFeed();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isValid = commentText.length > 0 && commentText.length <= MAX_COMMENT_LENGTH;
  const remaining = MAX_COMMENT_LENGTH - commentText.length;
  const shouldShowWarning = remaining <= WARNING_THRESHOLD;

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

    // Optimistic update
    const createdAt = new Date().toISOString();
    setPosts((draft) => {
      const targetPost = draft.find((post) => post.id === postId);
      if (!targetPost) throw new Error("Post not found");
      targetPost.commentCount += 1;
    });

    // Submit the comment to the server
    fetcher.submit(
      {
        _action: "comment",
        postId,
        ...(parentId && { parentId }),
        text: commentText,
        createdAt,
      },
      { method: "POST", action: "/?index" }
    );

    setCommentText("");
    setOpen(false);
  };

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Trigger, Content, Header, Title, Description }) => (
        <>
          <div className="flex items-center space-x-2">
            <Trigger>
              <Comment className="text-inactive w-5 h-5" />
            </Trigger>
            <div className="min-w-3">
              {count > 0 && <p className="text-inactive text-sm">{count}</p>}
            </div>
          </div>
          <Content>
            <Header>
              <Title>Comment</Title>
              <Description>Leave a comment below</Description>
            </Header>
            <fetcher.Form onSubmit={handleSubmit}>
              <div className="relative">
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

export default PostComment;
