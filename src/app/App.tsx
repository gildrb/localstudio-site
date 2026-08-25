import {
  startTransition,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSkySelection } from "../hooks/use-sky-selection";
import { pages } from "./pages";
import { NotFoundPage } from "../pages/NotFoundPage";
import {
  notFoundTitle,
  redirectFor,
  routeTitle,
} from "../domain/route";
import {
  emitNavigation,
  isRoutePath,
  normalizePath,
  scrollToHash,
  subscribeToNavigation,
} from "./browser-location";


type NavigationSource = "load" | "push" | "pop";

export default function App() {
  useSkySelection();
  const [location, setLocation] = useState(
    () => `${window.location.pathname}${window.location.hash}`,
  );
  const navigationSource = useRef<NavigationSource>("load");
  const pathname = normalizePath(location.split("#")[0] ?? "");
  const redirect = redirectFor(pathname);
  const Page = isRoutePath(pathname) ? pages[pathname] : null;
  useEffect(() => {
    if (!redirect) return;
    window.history.replaceState({}, "", redirect);
    emitNavigation();
  }, [redirect]);

  useEffect(() => {
    function updateLocation(source: NavigationSource) {
      navigationSource.current = source;
      if (source === "push" && !window.location.hash) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      startTransition(() => {
        setLocation(`${window.location.pathname}${window.location.hash}`);
      });
    }
    function handlePopState() {
      updateLocation("pop");
    }
    const unsubscribe = subscribeToNavigation(() => updateLocation("push"));
    window.addEventListener("popstate", handlePopState);
    return () => {
      unsubscribe();
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    document.title = isRoutePath(pathname)
      ? routeTitle(pathname)
      : notFoundTitle();
    const hash = window.location.hash;
    let frame = 0;
    let timeout = 0;
    let observer: MutationObserver | undefined;

    const stopWaiting = () => {
      observer?.disconnect();
      window.clearTimeout(timeout);
    };
    const finishNavigation = () => {
      if (hash) return scrollToHash(hash);
      if (navigationSource.current !== "push") return true;
      const heading = document.querySelector("main h1, [data-page-focus]");
      if (!(heading instanceof HTMLElement)) return false;
      heading.focus({ preventScroll: true });
      return true;
    };

    frame = window.requestAnimationFrame(() => {
      if (finishNavigation()) return;
      observer = new MutationObserver(() => {
        if (finishNavigation()) stopWaiting();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(stopWaiting, 3000);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      stopWaiting();
    };
  }, [location, pathname]);

  if (!Page) return <NotFoundPage />;
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );
}
