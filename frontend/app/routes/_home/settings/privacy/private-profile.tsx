import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useFetcher } from "@remix-run/react";
import { LockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { action } from ".";

const PrivateProfile = ({ isPrivate }: { isPrivate: boolean }) => {
  const { toast } = useToast();
  const [checked, setChecked] = useState(isPrivate);
  const fetcher = useFetcher<typeof action>();

  const handleChange = async (checked: boolean) => {
    setChecked(checked);
    fetcher.submit(
      { _action: "private", isPrivate: checked },
      { method: "PUT", action: `/settings/privacy` }
    );
  };

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.actionState) return;

    const { actionState } = fetcher.data;
    if (actionState._action !== "private") return;
    if (actionState.message) {
      setChecked((prev) => !prev);
      toast({
        variant: "primary",
        title: actionState.message,
      });
    } else {
      toast({
        variant: "primary",
        title: "Settings updated.",
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="flex-between my-2">
      <div className="flex-center gap-x-2">
        <LockIcon className="w-5 h-5" />
        <p>Private profile</p>
      </div>
      <Switch checked={checked} onCheckedChange={handleChange} />
    </div>
  );
};

export default PrivateProfile;
