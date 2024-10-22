import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginForm from "@/routes/_auth/login";
import { DialogDescription } from "@radix-ui/react-dialog";
import Mark from "../shared/mark";

export default function LoginModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger className="flex-center">{children}</DialogTrigger>
      <DialogContent className="w-[420px] flex flex-col items-center !rounded-3xl py-10">
        <DialogHeader>
          <DialogTitle className="-ml-4 mb-6">
            <Mark />
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
