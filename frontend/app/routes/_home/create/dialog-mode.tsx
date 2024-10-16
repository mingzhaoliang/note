import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PostForm from "./post-form";

type DialogModeProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function DialogMode({ open, setOpen }: DialogModeProps) {
  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogContent className="!rounded-3xl max-w-screen-sm bg-background no-highlight">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription>Share your thoughts with the world.</DialogDescription>
        </DialogHeader>
        <PostForm />
      </DialogContent>
    </Dialog>
  );
}
