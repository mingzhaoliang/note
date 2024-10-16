import { ActionFunctionArgs } from "@remix-run/node";
import { useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import DialogMode from "./dialog-mode";
import DrawerMode from "./drawer-mode";

export default function CreatePost() {
  const [open, setOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const location = useLocation();
  const referrer = location.state?.referrer || "/";

  useEffect(() => {
    if (!open) {
      navigate(referrer, { replace: true, state: { referrer: null } });
    }
  }, [open, navigate, referrer]);

  return (
    <>
      {isDesktop ? (
        <DialogMode open={open} setOpen={setOpen} />
      ) : (
        <DrawerMode open={open} setOpen={setOpen} />
      )}
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData);

  // TODO - submit form data
  return null;
}
