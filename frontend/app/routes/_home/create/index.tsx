import { uploadImage } from "@/service/.server/cloudinary.service";
import { redirectIfUnauthenticated } from "@/session/guard.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfUnauthenticated(request);

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = await getPayload(formData);

  // TODO - submit form data
  return null;
}

const uploadHandler = async (data: File) => {
  const {
    public_id: publicId,
    resource_type: resourceType,
    type,
    version,
  } = await uploadImage(data, { folder: "/note/post" });

  return { publicId, resourceType, type, version };
};

const getPayload = async (formData: FormData) => {
  const payload: Record<string, any> = {};

  for (const [name, data] of formData) {
    if (/^[a-z]+\.\d+$/.test(name)) {
      const key = name.split(".")[0];

      let value;
      if (data instanceof File) {
        value = await uploadHandler(data);
      } else {
        value = data;
      }

      payload[key] = (payload[key] || []).concat(value);
    } else {
      payload[name] = data;
    }
  }

  return payload;
};
