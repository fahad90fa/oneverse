import { SlideTransition, ScaleTransition, FadeTransition, PageTransition } from "./pageTransitions";

export const getRouteTransition = (pathname: string) => {
  if (pathname.startsWith("/dashboard")) {
    return SlideTransition;
  } else if (pathname.startsWith("/profile")) {
    return ScaleTransition;
  } else if (pathname.startsWith("/chat")) {
    return FadeTransition;
  } else {
    return PageTransition;
  }
};
