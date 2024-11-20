import { GalleryAdd } from "@/components/icons";
import LexicalComposer from "@/components/shared/lexical-composer";
import { Button } from "@/components/ui/button";
import { MAX_NOTE_LENGTH, MAXIMUM_IMAGES, WARNING_THRESHOLD } from "@/config/post.config";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { action } from "@/routes/_home/profile/$username_.post/_index";
import { postFormSchema, PostFormSchema } from "@/schemas/post/post-form.schema";
import { useSession } from "@/store/context/session.context";
import { useAppDispatch } from "@/store/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { useFetcher, useNavigate } from "@remix-run/react";
import { EditorState, LexicalEditor } from "lexical";
import { HashIcon } from "lucide-react";
import { useRef } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import PostImagesSection from "./post-images-section";
import PostTagsSection, { PostTagsSectionRef } from "./post-tags-section";

type PostFormProps = {
  className?: string;
  setOpen: (open: boolean) => void;
};

export default function PostForm({ className, setOpen }: PostFormProps) {
  const fetcher = useFetcher<typeof action>({ key: "create-post" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<PostTagsSectionRef>(null);
  const { toast } = useToast();
  const { user } = useSession();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<PostFormSchema>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      text: "",
      images: [],
      tags: [],
    },
  });

  const remaining = MAX_NOTE_LENGTH - form.watch("text").length;
  const shouldShowWarning = remaining <= WARNING_THRESHOLD;
  const imageCount = form.watch("images").length;

  const handleEditorChange = (editorState: EditorState, editor: LexicalEditor) => {
    const textContent = editor.getRootElement()?.textContent;
    form.setValue("text", textContent || "", { shouldValidate: true });
  };

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    fileInputRef.current?.click();
  };

  const handleTagEdit = () => {
    tagInputRef.current?.append();
  };

  const onSubmit: SubmitHandler<PostFormSchema> = (data, event) => {
    if (!user) return navigate("/login");

    const formData = new FormData(event?.target);

    formData.set("_action", "create");
    formData.set("text", data.text);

    fetcher.submit(formData, {
      method: "POST",
      action: `/profile/${user.username}/post?index`,
      encType: "multipart/form-data",
    });
  };

  const onError: SubmitErrorHandler<PostFormSchema> = (error) =>
    toast({ variant: "primary", title: Object.values(error)[0].message });

  return (
    <FormProvider {...form}>
      <fetcher.Form
        className={cn("max-md:pb-4 flex flex-col gap-4", className)}
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <PostImagesSection ref={fileInputRef} name="images" />

        <div className="flex-1 space-y-4">
          <div className="relative">
            <LexicalComposer>
              <PlainTextPlugin
                contentEditable={
                  <ContentEditable
                    name="text"
                    className="editor-input"
                    aria-placeholder="What's on your mind?"
                    placeholder={<div className="editor-placeholder">What's on your mind?</div>}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <OnChangePlugin onChange={handleEditorChange} />
            </LexicalComposer>
          </div>
          <PostTagsSection ref={tagInputRef} name="tags" />
          <div className="flex gap-x-4">
            <button
              type="button"
              disabled={imageCount >= MAXIMUM_IMAGES}
              className="clickable disabled:unavailable"
              onClick={handleImageUpload}
            >
              <GalleryAdd className="w-6 h-6" />
            </button>
            <HashIcon className="w-6 h-6 clickable" onClick={handleTagEdit} />
          </div>
        </div>
        <div className="flex-between">
          <p className={cn("text-inactive text-sm", remaining < 0 && "text-destructive")}>
            {shouldShowWarning && remaining}
          </p>
          <Button
            disabled={!form.formState.isValid || fetcher.state !== "idle"}
            variant="outline"
            type="submit"
            className="rounded-xl bg-primary-foreground"
          >
            {fetcher.state !== "idle" ? "Posting..." : "Post"}
          </Button>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
