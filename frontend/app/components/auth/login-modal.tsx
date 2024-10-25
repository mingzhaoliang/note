import LoginForm from "@/routes/_auth/login";
import { useState } from "react";
import Mark from "../shared/mark";
import { ResponsiveDialog } from "../ui/responsive-dialog";

export default function LoginModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ResponsiveDialog query="(min-width: 768px)" modal open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <>
          <Trigger className="flex-center">{children}</Trigger>
          <Content className="responsive-dialog-content md:w-[420px] flex flex-col items-center px-4 pb-6 md:py-10">
            <Header>
              <Title className="-ml-4 mb-6">
                <Mark />
              </Title>
              <Description className="hidden" />
            </Header>
            <LoginForm />
          </Content>
        </>
      )}
    </ResponsiveDialog>
  );
}
