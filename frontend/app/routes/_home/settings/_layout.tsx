import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NavTab, NavTabItem } from "@/components/ui/nav-tab";
import { Outlet, useNavigate } from "@remix-run/react";
import { ArrowLeftIcon } from "lucide-react";

export default function SettingsLayout() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-screen-md h-screen flex flex-col mx-auto p-6">
      <div className="flex items-center gap-x-2 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </Button>
        <h1 className="max-md:text-center text-xl font-semibold">Settings</h1>
      </div>
      <Card className="flex-1 w-full rounded-xl bg-primary-foreground">
        <CardHeader>
          <NavTab>
            <NavTabItem to="privacy" className="md:text-base">
              Privacy
            </NavTabItem>
            <NavTabItem to="account" className="md:text-base">
              Account
            </NavTabItem>
          </NavTab>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
}
