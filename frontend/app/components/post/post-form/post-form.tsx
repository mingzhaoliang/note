import { GalleryAdd } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MAXIMUM_IMAGES } from "@/config/post.config";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";
import { postFormSchema, PostFormSchema } from "@/schemas/post/post-form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher, useNavigate } from "@remix-run/react";
import { HashIcon, MapPinIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { FormProvider, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import PostImagesSection from "./post-images-section";
import PostTagsSection, { PostTagsSectionRef } from "./post-tags-section";

type PostFormProps = {
  className?: string;
  setOpen: (open: boolean) => void;
};

export default function PostForm({ className, setOpen }: PostFormProps) {
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<PostTagsSectionRef>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<PostFormSchema>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      text: "",
      images: [],
      tags: [],
    },
  });

  const imageCount = form.watch("images").length;

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
    const formData = new FormData(event?.target);
    formData.append("_action", "create");

    fetcher.submit(formData, {
      method: "POST",
      action: "/?index",
      encType: "multipart/form-data",
    });

    setOpen(false);

    navigate("/");
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
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoComplete="off"
                    autoCapitalize="off"
                    className="masked-input"
                    placeholder="What's on your mind?"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
            <MapPinIcon className="w-6 h-6 clickable" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" type="submit" className="rounded-xl bg-primary-foreground">
            Post
          </Button>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
