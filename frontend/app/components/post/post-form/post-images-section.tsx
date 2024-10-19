import { FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import PostImageInput from "./post-image-input";
import { MAXIMUM_IMAGES } from "@/config/post.config";

type PostImagesSectionProps = {
  name: string;
};

const PostImagesSection = forwardRef<HTMLInputElement, PostImagesSectionProps>(
  function PostImagesSection(props, ref) {
    const name = "images";
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name });

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        append(Array.from(files).slice(0, MAXIMUM_IMAGES - fields.length));
      }
    };

    return (
      <div className="">
        <Input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <FormField
          control={control}
          name={name}
          render={() => (
            <FormItem className="space-y-0 flex gap-3 overflow-scroll">
              {fields.map((field, index) => (
                <PostImageInput
                  key={field.id}
                  index={index}
                  name={name}
                  remove={() => remove(index)}
                />
              ))}
            </FormItem>
          )}
        />
      </div>
    );
  }
);

export default PostImagesSection;
