import envConfig from "@/config/env.config.server";
import { uploadImage } from "@/service/.server/cloudinary.service";
import { commitBaseSession, getBaseSession } from "@/session/base-session.server";
import { redirectIfUnauthenticated, requireUser } from "@/session/guard.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs, replace } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import DialogMode from "./dialog-mode";
import DrawerMode from "./drawer-mode";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost() {
  const [open, setOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const navigate = useNavigate();
  const location = useLocation();
  const referrer = location.state?.referrer || "/";
  const { toast } = useToast();
  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!open) {
      navigate(referrer, { replace: true, state: { referrer: null } });
    }
  }, [open, navigate, referrer]);

  useEffect(() => {
    if (loaderData.message) {
      toast({ variant: "primary", title: loaderData.message });
    }
  }, [loaderData]);

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

  const baseSession = await getBaseSession(request.headers.get("Cookie"));
  const message: string | null = baseSession.get("message") || null;

  return json({ message }, { headers: { "Set-Cookie": await commitBaseSession(baseSession) } });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const payload = await getPayload(formData);

  const { authHeader, user } = await requireUser(request);
  payload.userId = user.id;

  const response = await fetch(`${envConfig.API_URL}/post/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const { error } = await response.json();

    const baseSession = await getBaseSession(request.headers.get("Cookie"));
    baseSession.flash("message", error);

    return json(
      {},
      { status: 400, headers: { "Set-Cookie": await commitBaseSession(baseSession) } }
    );
  }

  return replace("/", { headers: authHeader ? { "Set-Cookie": authHeader } : undefined });
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
