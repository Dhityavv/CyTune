import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import AppLink from "@/components/AppLink";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center py-10 px-4 relative">
      <AppLink
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1.5 px-3 rounded-xl bg-surface/70 border border-border-subtle"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to CyTune</span>
      </AppLink>
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        }
      >
        <SignIn />
      </Suspense>
    </div>
  );
}
