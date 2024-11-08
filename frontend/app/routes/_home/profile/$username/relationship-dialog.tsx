import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resetRelationships } from "@/store/redux/features/relationship-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import FollowerList from "./follower-list";
import FollowerRequestList from "./follower-request-list";
import FollowingList from "./following-list";

const RelationshipDialog = ({ followerCount }: { followerCount: number }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setOpen(false);
    dispatch(resetRelationships());
  }, [pathname, dispatch, resetRelationships]);

  return (
    <ResponsiveDialog query="(min-width: 768px)" open={open} onOpenChange={setOpen}>
      {({ Header, Title, Content, Description, Trigger }) => (
        <Tabs defaultValue="followers">
          <Trigger className="text-sm text-muted-foreground">
            <p className="text-start">
              {followerCount} {followerCount <= 1 ? "Follower" : "Followers"}
            </p>
          </Trigger>

          <Content hideXButton className="responsive-dialog-content">
            <Header>
              <VisuallyHidden>
                <Title>Followers and Following</Title>
                <Description />
              </VisuallyHidden>
              <TabsList className="!mt-0 grid w-full grid-cols-3">
                <TabsTrigger value="followers" className="md:text-base">
                  Followers
                </TabsTrigger>
                <TabsTrigger value="following" className="md:text-base">
                  Following
                </TabsTrigger>
                <TabsTrigger value="requests" className="md:text-base">
                  Requests
                </TabsTrigger>
              </TabsList>
            </Header>
            <TabsContent value="followers">
              <FollowerList />
            </TabsContent>
            <TabsContent value="following">
              <FollowingList />
            </TabsContent>
            <TabsContent value="requests">
              <FollowerRequestList />
            </TabsContent>
          </Content>
        </Tabs>
      )}
    </ResponsiveDialog>
  );
};

export default RelationshipDialog;
