import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "usehooks-ts";

export type ResponsiveDialogChildren = {
  Header: typeof DialogHeader | typeof DrawerHeader;
  Title: typeof DialogTitle | typeof DrawerTitle;
  Content: typeof DialogContent | typeof DrawerContent;
  Description: typeof DialogDescription | typeof DrawerDescription;
  Footer: typeof DialogFooter | typeof DrawerFooter;
  Close: typeof DialogClose | typeof DrawerClose;
  Trigger: typeof DialogTrigger | typeof DrawerTrigger;
};

export type ResponsiveDialogProps = Omit<
  React.ComponentProps<typeof Dialog | typeof Drawer>,
  "children"
> & {
  query: string;
  children: ({
    Header,
    Title,
    Content,
    Description,
    Footer,
    Close,
    Trigger,
  }: ResponsiveDialogChildren) => JSX.Element;
  [key: string]: any;
};

const ResponsiveDialog = ({ query, children, ...props }: ResponsiveDialogProps) => {
  const isDesktop = useMediaQuery(query);

  const Root = isDesktop ? Dialog : Drawer;
  const Header = isDesktop ? DialogHeader : DrawerHeader;
  const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop ? DialogDescription : DrawerDescription;
  const Footer = isDesktop ? DialogFooter : DrawerFooter;
  const Close = isDesktop ? DialogClose : DrawerClose;

  return (
    <Root {...props}>
      {children({
        Header,
        Title,
        Content,
        Description,
        Footer,
        Close,
        Trigger,
      })}
    </Root>
  );
};

export { ResponsiveDialog };
