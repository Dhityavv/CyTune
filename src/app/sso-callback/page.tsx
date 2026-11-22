import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas text-text-primary">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-text-secondary">Authenticating with Clerk...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
