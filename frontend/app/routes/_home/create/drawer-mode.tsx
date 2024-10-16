import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import PostForm from "./post-form";

type DrawerModeProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function DrawerMode({ open, setOpen }: DrawerModeProps) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="h-[calc(100vh-4rem)]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Note</DrawerTitle>
          <DrawerDescription>Share your thoughts with the world.</DrawerDescription>
        </DrawerHeader>
        <PostForm className="flex-1 px-4" />
      </DrawerContent>
    </Drawer>
  );
}
