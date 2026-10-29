export function respondWith(status: number, data: unknown, message: string): Response {
  return Response.json({ data, message }, { status });
}
