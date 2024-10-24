import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon } from "lucide-react";
import DeletePostForm from "./delete-post-form";

type PostDropdownProps = {
  isOwner: boolean;
  postId: string;
  onDelete?: () => void;
};

export default function PostDropdown({ isOwner, postId, onDelete }: PostDropdownProps) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
          <Button
            variant="ghost"
            size="icon"
            className="!h-fit rounded-full text-inactive hover:text-primary hover:bg-transparent"
          >
            <EllipsisIcon className="w-6 h-6" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          onClick={(e) => e.stopPropagation()}
          align="end"
          className="w-60 p-2 font-medium bg-primary-foreground"
        >
          {isOwner && (
            <DropdownMenuItem className="p-3" asChild>
              <AlertDialogTrigger
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
                asChild
              >
                <button className="w-full h-full flex-start">Delete</button>
              </AlertDialogTrigger>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent
        overlayConfig={{ onClick: (e) => e.stopPropagation() }}
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure to delete this post?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <DeletePostForm postId={postId} onDelete={onDelete} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
