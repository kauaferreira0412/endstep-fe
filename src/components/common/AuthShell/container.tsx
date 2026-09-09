import type { ReactNode } from "react";
import { AuthShellView } from "./index";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <AuthShellView title={title} subtitle={subtitle} footer={footer}>
      {children}
    </AuthShellView>
  );
}
