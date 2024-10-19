import { FormField, FormItem } from "@/components/ui/form";
import { forwardRef, useImperativeHandle } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import PostTagInput from "./post-tag-input";

export type PostTagsSectionRef = {
  append: () => void;
};

type PostTagsSectionProps = {
  name: string;
};

const PostTagsSection = forwardRef<PostTagsSectionRef, PostTagsSectionProps>(
  function PostTagsSection({ name }, ref) {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name });

    useImperativeHandle(ref, () => ({
      append() {
        append("#");
      },
    }));

    return (
      <FormField
        control={control}
        name={name}
        render={() => (
          <FormItem className="space-y-0 flex gap-3">
            {fields.map((field, index) => (
              <PostTagInput key={field.id} index={index} name={name} remove={remove} />
            ))}
          </FormItem>
        )}
      />
    );
  }
);

export default PostTagsSection;
