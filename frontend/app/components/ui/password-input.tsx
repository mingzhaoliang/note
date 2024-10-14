import { Slot } from "@radix-ui/react-slot";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { Input, InputProps } from "./input";

interface PasswordInputProps extends Omit<InputProps, "type" | "aria-label"> {
  field?: ControllerRenderProps<any, any>;
}

export default function PasswordInput({ field, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((s) => !s);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        aria-label="Password"
        {...props}
        {...field}
      />
      <Slot
        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
        onClick={toggleShowPassword}
      >
        {showPassword ? <EyeIcon /> : <EyeOffIcon />}
      </Slot>
    </div>
  );
}
