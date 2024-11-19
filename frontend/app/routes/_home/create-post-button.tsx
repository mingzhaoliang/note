import LoginModal from "@/components/auth/login-modal";
import CreatePostDialog from "@/components/post/create-post-dialog";
import { useSession } from "@/store/context/session.context";
import { PlusIcon } from "lucide-react";
import NavIcon from "./nav-icon";
import ReactiveAccountDialog from "./settings/account/reactivate-account-dialog";

export default function CreatePostButton() {
  const { user } = useSession();

  const postButton = (
    <NavIcon
      Icon={PlusIcon}
      className="text-muted-foreground group-hover:text-primary hover:bg-secondary"
      still
    />
  );

  if (!user || user.deactivated) {
    const Comp = user?.deactivated ? ReactiveAccountDialog : LoginModal;
    return <Comp>{postButton}</Comp>;
  }

  return <CreatePostDialog>{postButton}</CreatePostDialog>;
}
