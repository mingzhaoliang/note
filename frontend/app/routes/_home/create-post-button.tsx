import LoginModal from "@/components/auth/login-modal";
import CreatePostDialog from "@/components/post/create-post-dialog";
import { PlusIcon } from "lucide-react";
import NavIcon from "./nav-icon";
import { useSession } from "@/store/session.context";

export default function CreatePostButton() {
  const { user } = useSession();

  const postButton = (
    <NavIcon
      Icon={PlusIcon}
      className="text-muted-foreground group-hover:text-primary hover:bg-secondary"
      still
    />
  );

  return (
    <>
      {user && <CreatePostDialog trigger={postButton} />}
      {!user && <LoginModal>{postButton}</LoginModal>}
    </>
  );
}
