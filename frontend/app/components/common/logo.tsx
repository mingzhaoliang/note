import { cn } from "@/lib/utils/cn";
import { CircleFadingPlus } from "lucide-react";

export default function Logo({ className }: { className?: string }) {
  return <CircleFadingPlus className={cn("cursor-pointer", className)} />;
}
