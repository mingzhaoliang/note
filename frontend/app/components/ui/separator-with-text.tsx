const SeparatorWithText = ({ text }: { text: string }) => (
  <div className="flex items-center">
    <hr className="flex-1" />
    <span className="font-light text-muted-foreground text-sm mx-2">{text}</span>
    <hr className="flex-1" />
  </div>
);

export { SeparatorWithText };
