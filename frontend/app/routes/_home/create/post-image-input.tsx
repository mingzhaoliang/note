import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

type PostImageInputProps = {
  index: number;
  name: string;
  remove: () => void;
};

export default function PostImageInput({ index, name, remove }: PostImageInputProps) {
  const { control, watch } = useFormContext();
  const file = watch(`${name}.${index}`);
  const preview = URL.createObjectURL(file);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputRef.current.files = dataTransfer.files;
  }, [file]);

  return (
    <FormField
      control={control}
      name={`${name}.${index}`}
      render={({ field: { name } }) => (
        <FormItem>
          <div className="relative w-24 h-24 rounded-xl overflow-hidden">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <Button
              variant="secondary"
              className="absolute top-1 right-1 rounded-full !w-fit !h-fit p-1 bg-secondary/60"
              onClick={remove}
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
          <FormControl>
            <Input ref={inputRef} name={name} type="file" accept="image/*" className="hidden" />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
