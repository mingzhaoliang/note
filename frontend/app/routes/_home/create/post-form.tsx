import { GalleryAdd } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { postFormSchema, PostFormSchema } from "@/schemas/post/post-form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useSubmit } from "@remix-run/react";
import { HashIcon, MapPinIcon } from "lucide-react";
import { useRef } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import PostImagesSection from "./post-images-section";
import PostTagsSection, { PostTagsSectionRef } from "./post-tags-section";

export default function PostForm({ className }: React.ComponentProps<"form">) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<PostTagsSectionRef>(null);

  const form = useForm<PostFormSchema>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      text: "",
      images: [],
      tags: [],
    },
  });

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    fileInputRef.current?.click();
  };

  const handleTagEdit = () => {
    tagInputRef.current?.append();
  };

  const submit = useSubmit();
  const onSubmit: SubmitHandler<PostFormSchema> = (data, event) => {
    submit(event?.target, { method: "POST", action: "/create", encType: "multipart/form-data" });
  };

  return (
    <FormProvider {...form}>
      <Form
        className={cn("max-md:pb-4 flex flex-col gap-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
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
            <GalleryAdd className="w-6 h-6 clickable" onClick={handleImageUpload} />
            <HashIcon className="w-6 h-6 clickable" onClick={handleTagEdit} />
            <MapPinIcon className="w-6 h-6 clickable" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" type="submit" className="rounded-xl">
            Post
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}
