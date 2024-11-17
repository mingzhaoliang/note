import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon } from "lucide-react";
import DeletePostAlertContent from "./delete-post-alert-content";

type PostDropdownProps = {
  isOwner: boolean;
  postId: string;
  onDelete?: (id: string) => void;
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
      <DeletePostAlertContent postId={postId} onDelete={onDelete} />
    </AlertDialog>
  );
}
