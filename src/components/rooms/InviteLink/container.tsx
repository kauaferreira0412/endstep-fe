import { useState } from "react";
import { InviteLinkView } from "./index";

export function InviteLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/play/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* fallback: apenas mostra o feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return <InviteLinkView code={code} url={url} copied={copied} onCopy={() => void copy()} />;
}
