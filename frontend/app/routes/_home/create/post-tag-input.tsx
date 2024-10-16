import { FormControl, FormField, FormItem } from "@/components/ui/form";
import InputAutoWidth from "@/components/ui/input-auto-width";
import { XIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";

type PostTagInputProps = {
  index: number;
  name: string;
  remove: () => void;
};

export default function PostTagInput({ index, name, remove }: PostTagInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={`${name}.${index}`}
      render={({ field }) => {
        const { onChange, onBlur, ...rest } = field;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.startsWith("#") ? onChange?.(e) : remove();
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
          e.target.value.length === 1 ? remove() : onBlur?.();

        return (
          <FormItem className="space-y-0 flex-between px-2 bg-secondary rounded-xl">
            <FormControl>
              <InputAutoWidth
                autoComplete="off"
                autoCapitalize="off"
                className="masked-input h-8"
                onChange={handleChange}
                onBlur={handleBlur}
                {...rest}
              />
            </FormControl>
            <XIcon className="w-3 h-3 cursor-pointer" onClick={remove} />
          </FormItem>
        );
      }}
    />
  );
}
