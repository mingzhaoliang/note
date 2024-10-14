import { cn } from "@/lib/utils/cn";
import { CircleFadingPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "remix-themes";

export default function Logo({ className }: { className?: string }) {
  const [isClient, setIsClient] = useState(false);
  const [theme] = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <CircleFadingPlus
      className={cn("cursor-pointer", isClient && theme === "dark" && "invert", className)}
    />
  );
}
