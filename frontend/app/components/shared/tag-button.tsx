import { cn } from "@/lib/utils/cn";
import { useNavigate } from "@remix-run/react";
import { Button, ButtonProps } from "../ui/button";

type TagButtonProps = ButtonProps & {
  tag: string;
};

const TagButton = ({ tag, variant, className, size, onClick, ...props }: TagButtonProps) => {
  const navigate = useNavigate();

  const handleTagClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    onClick?.(event);
    navigate("/explore/posts?" + new URLSearchParams({ q: tag }).toString());
  };

  return (
    <Button
      variant={variant ?? "secondary"}
      size={size ?? "sm"}
      className={cn("rounded-full !w-fit !h-fit px-2.5 py-0.5 text-xs", className)}
      onClick={handleTagClick}
      {...props}
    >
      {tag}
    </Button>
  );
};

export default TagButton;
