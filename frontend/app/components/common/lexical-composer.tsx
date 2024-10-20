import { LexicalComposer as Provider } from "@lexical/react/LexicalComposer";

const onEditorError = (error: any) => {
  console.error(error);
  throw error;
};

const initialConfig = {
  namespace: "MyEditor",
  onError: onEditorError,
};

type LexicalComposerProps = {
  editorConfig?: any;
};

const LexicalComposer = ({
  children,
  editorConfig,
}: React.PropsWithChildren<LexicalComposerProps>) => {
  return <Provider initialConfig={{ ...initialConfig, ...editorConfig }}>{children}</Provider>;
};

export default LexicalComposer;
