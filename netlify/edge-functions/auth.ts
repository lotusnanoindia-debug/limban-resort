import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  // Only protect /nabmil paths
  if (!url.pathname.startsWith("/nabmil")) {
    return;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Access"',
      },
    });
  }

  const [scheme, encoded] = authHeader.split(" ");

  if (scheme !== "Basic") {
    return new Response("Invalid authentication scheme", { status: 401 });
  }

  const buffer = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const decoded = new TextDecoder().decode(buffer);
  const [username, password] = decoded.split(":");

  // Change these credentials
  const VALID_USERNAME = "limban";
  const VALID_PASSWORD = "tiger2025";

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    return; // Allow access
  }

  return new Response("Invalid credentials", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Access"',
    },
  });
};
