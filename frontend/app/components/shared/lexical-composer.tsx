import { LexicalComposer as Provider } from "@lexical/react/LexicalComposer";
import ClientOnly from "./client-only";

const onEditorError = (error: any) => {
  console.error(error);
  throw error;
};

const initialConfig = {
  namespace: "MyEditor",
  onError: onEditorError,
};

type LexicalComposerProps = {
  editorConfig?: Partial<React.ComponentPropsWithoutRef<typeof Provider>["initialConfig"]>;
};

const LexicalComposer = ({
  children,
  editorConfig,
}: React.PropsWithChildren<LexicalComposerProps>) => {
  return (
    <ClientOnly>
      <Provider initialConfig={{ ...initialConfig, ...editorConfig }}>{children}</Provider>
    </ClientOnly>
  );
};

export default LexicalComposer;
