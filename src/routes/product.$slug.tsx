import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/product/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/shop/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
  component: () => null,
});