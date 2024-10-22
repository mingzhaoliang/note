import * as React from "react";

import { cn } from "@/lib/utils/cn";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";

export interface TextareaProps extends TextareaAutosizeProps {
  autoSize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize, ...props }, ref) => {
    const Comp = autoSize ? TextareaAutosize : "textarea";
    return (
      <Comp
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
