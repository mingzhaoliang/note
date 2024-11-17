import { Input } from "@/components/ui/input";
import { setPosts, setProfiles } from "@/store/redux/features/explore-slice";
import { useAppDispatch } from "@/store/redux/hooks";
import {
  Form,
  Outlet,
  useLocation,
  useMatches,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import ExploreNavbar from "./explore-navbar";

export default function ExploreLayout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const { pathname } = useLocation();
  const initialised = useRef({ posts: false, profiles: false });
  const matches = useMatches();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const onSubmit = () => {
    initialised.current = { posts: false, profiles: false };
  };

  useEffect(() => {
    if (navigation.state === "idle") {
      matches.forEach((match: any) => {
        if (match.id === "routes/_home/explore/posts/index") {
          if (!initialised.current.posts) {
            initialised.current.posts = true;
            dispatch(setPosts(match.data.posts));
          }
        }
        if (match.id === "routes/_home/explore/users/index") {
          if (!initialised.current.profiles) {
            initialised.current.profiles = true;
            dispatch(setProfiles(match.data.profiles));
          }
        }
      });
    }
  }, [matches, navigation.state, dispatch]);

  return (
    <div className="flex-1 flex flex-col items-center p-6 w-full md:max-w-2xl mx-auto">
      <Form
        className="mb-4 flex items-center gap-2 w-full bg-muted rounded-full px-4 py-2"
        method="GET"
        action={pathname === "/explore" ? "/explore/posts" : pathname}
        onSubmit={onSubmit}
      >
        <SearchIcon />
        <Input
          type="search"
          name="q"
          defaultValue={query || ""}
          placeholder="Search"
          className="masked-input no-highlight"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
        />
      </Form>
      {query && <ExploreNavbar />}
      <Outlet key={query} />
    </div>
  );
}
