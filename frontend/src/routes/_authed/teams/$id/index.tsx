import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/teams/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authed/teams/$id/"!</div>;
}
