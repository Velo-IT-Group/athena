import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/contacts/$id/engagements')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/contacts/$id/engagements"!</div>
}
