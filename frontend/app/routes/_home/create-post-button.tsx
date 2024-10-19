import LoginModal from "@/components/auth/login-modal";
import CreatePostDialog from "@/components/post/create-post-dialog";
import { PlusIcon } from "lucide-react";
import NavIcon from "./nav-icon";

type CreatePostButtonProps = {
  isAuthenticated: boolean;
};

export default function CreatePostButton({ isAuthenticated }: CreatePostButtonProps) {
  const postButton = (
    <NavIcon
      Icon={PlusIcon}
      className="text-muted-foreground group-hover:text-primary hover:bg-secondary"
      still
    />
  );

  return (
    <>
      {isAuthenticated && <CreatePostDialog trigger={postButton} />}
      {!isAuthenticated && <LoginModal>{postButton}</LoginModal>}
    </>
  );
}
