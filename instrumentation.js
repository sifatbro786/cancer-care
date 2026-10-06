/**
 * Server error reporting (B7). Next calls onRequestError for every uncaught error in
 * Server Components, Route Handlers, Server Actions and the proxy.
 * Output = one JSON line on stderr → PM2 / journald on the VPS keep it; grep by `digest`
 * (the code shown to users on the error page) to find the matching stack.
 * Deliberately NOT logged: headers, cookies, query strings, bodies (patient data, tokens).
 */
export async function onRequestError(err, request, context) {
  const e = err instanceof Error ? err : new Error(String(err));
  const line = {
    level: "error",
    at: new Date().toISOString(),
    digest: typeof err === "object" && err && "digest" in err ? String(err.digest) : undefined,
    message: e.message?.slice(0, 500),
    stack: e.stack?.split("\n").slice(0, 8).join("\n"),
    method: request?.method,
    path: typeof request?.path === "string" ? request.path.split("?")[0] : undefined,
    route: context?.routePath,
    routeType: context?.routeType,
    renderSource: context?.renderSource,
  };
  console.error(JSON.stringify(line));
}
