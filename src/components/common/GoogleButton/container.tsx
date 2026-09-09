import { GoogleButtonView } from "./index";

export function GoogleButton({ label = "Entrar com Google" }: { label?: string }) {
  return <GoogleButtonView label={label} />;
}
