import { CircleCheckIcon, CircleXIcon, Loader2Icon } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import { Input, InputProps } from "./input";

type UniqueInputProps = InputProps & {
  checkFn: (value: any) => Promise<boolean>;
  checkFnCallback?: (isValid: boolean) => void;
};

const UniqueInput = forwardRef<HTMLInputElement, UniqueInputProps>(
  ({ checkFn, checkFnCallback, onChange, ...props }, ref) => {
    const ctx = useFormContext();
    const initialValue = ctx ? ctx.getValues(props.name!) : props.defaultValue;
    const [checking, setChecking] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isValid, setIsValid] = useState(true);

    const debouncedFn = useDebounceCallback(
      (value) =>
        checkFn(value)
          .then((isValid) => {
            setIsValid(isValid);
            checkFnCallback?.(isValid);
          })
          .finally(() => setChecking(false)),
      300
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setIsDirty(value !== initialValue);

        onChange?.(event);

        if (value === initialValue) {
          setIsValid(true);
          checkFnCallback?.(true);
        } else {
          setChecking(true);
          debouncedFn(value);
        }
      },
      [onChange, initialValue]
    );

    return (
      <div className="relative">
        <Input ref={ref} onChange={handleChange} {...props} />
        {isDirty && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex-center">
            {checking ? (
              <Loader2Icon className="animate-spin" />
            ) : isValid ? (
              <CircleCheckIcon className="text-green-500" />
            ) : (
              <CircleXIcon className="text-destructive" />
            )}
          </div>
        )}
      </div>
    );
  }
);

export default UniqueInput;
