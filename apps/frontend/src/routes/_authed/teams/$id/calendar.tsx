import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/teams/$id/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/teams/$id/calendar"!</div>
}
