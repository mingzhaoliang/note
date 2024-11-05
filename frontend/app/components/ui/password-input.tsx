import { Slot } from "@radix-ui/react-slot";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input, InputProps } from "./input";

const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "aria-label">>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => setShowPassword((s) => !s);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          aria-label="Password"
          {...props}
        />
        <Slot
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5"
          onClick={toggleShowPassword}
        >
          {showPassword ? <EyeIcon /> : <EyeOffIcon />}
        </Slot>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
