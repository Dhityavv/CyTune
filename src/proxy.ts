import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_dHJ1c3R5LXdoaXBwZXQtNDg3Mi5jbGVyay5hY2NvdW50cy5kZXYk";
const secretKey =
  process.env.CLERK_SECRET_KEY ||
  "sk_test_YNMxlvGNOMXupnt9JBiwwrXU03TECAwdT28cSaLcdl";

export default function proxy(req: NextRequest, event: any) {
  try {
    if (publishableKey && secretKey) {
      return (clerkMiddleware({ publishableKey, secretKey }) as any)(req, event);
    }
  } catch (error) {
    console.warn("Clerk proxy fallback pass-through:", error);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
