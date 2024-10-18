import {
  AlertDialog,
  AlertDialogAction,
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
import { Form } from "@remix-run/react";
import { EllipsisIcon } from "lucide-react";

type PostDropdownProps = {
  isOwner: boolean;
  postId: string;
};

export default function PostDropdown({ isOwner, postId }: PostDropdownProps) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-inactive hover:text-primary hover:bg-transparent"
          >
            <EllipsisIcon className="w-6 h-6" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60 p-2 font-medium bg-primary-foreground">
          {isOwner && (
            <DropdownMenuItem className="p-3" asChild>
              <AlertDialogTrigger className="cursor-pointer" asChild>
                <button className="w-full h-full flex-start">Delete</button>
              </AlertDialogTrigger>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure to delete this post?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Form method="POST" action="/?index">
            <input type="hidden" name="postId" value={postId} />
            <AlertDialogAction type="submit" name="_action" value="delete">
              Continue
            </AlertDialogAction>
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
