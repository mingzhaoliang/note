type Props = {
  CLOUDINARY_CLOUD_NAME: string;
};

const PublicEnv = (props: Props) => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.ENV = ${JSON.stringify(props)};`,
      }}
    />
  );
};

declare global {
  interface Window {
    ENV: { CLOUDINARY_CLOUD_NAME: string };
  }
}

export { PublicEnv };
