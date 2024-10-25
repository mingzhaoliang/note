import { cn } from "@/lib/utils/cn";
import { useNavigate } from "@remix-run/react";
import React from "react";

type UsernameButtonProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  username: string;
};

const UsernameButton = ({ username, className, ...props }: UsernameButtonProps) => {
  const navigate = useNavigate();
  const handleUsernameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/profile/${username}`);
  };

  return (
    <button
      className={cn("font-semibold hover:underline", className)}
      onClick={handleUsernameClick}
      {...props}
    >
      {username}
    </button>
  );
};

export default UsernameButton;
