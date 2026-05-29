import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static assets, image files and PWA assets
    // (the service worker, offline page and manifest must be reachable even
    // when signed out, or installation / SW registration would break).
    "/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
