import { createBrowserRouter } from "react-router";
import { PlanMeetupPage } from "./pages/plan-meetup-page";
import { ResultsPage } from "./pages/results-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PlanMeetupPage,
  },
  {
    path: "/results",
    Component: ResultsPage,
  },
]);
