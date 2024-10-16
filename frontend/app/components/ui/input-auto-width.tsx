import { forwardRef, useState } from "react";
import { Input, InputProps } from "./input";

type InputAutoWidthProps = InputProps;

const InputAutoWidth = forwardRef<HTMLInputElement, InputAutoWidthProps>(function InputAutoWidth(
  { autoFocus = true, onChange, ...props },
  ref
) {
  const [width, setWidth] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(e.target.value.length);
    onChange?.(e);
  };

  return (
    <Input
      ref={ref}
      autoFocus={autoFocus}
      onChange={handleChange}
      style={{ width: `calc(max(${width}ch, 2rem))` }}
      {...props}
    />
  );
});

export default InputAutoWidth;
