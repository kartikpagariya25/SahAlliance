import type { ReactNode } from "react";
import { useChain } from "../context/ChainContext";
import { SignInScreen } from "./SignInScreen";

export function RequireSignIn({ children }: { children: ReactNode }) {
  const { persona } = useChain();
  if (!persona) return <SignInScreen />;
  return <>{children}</>;
}
