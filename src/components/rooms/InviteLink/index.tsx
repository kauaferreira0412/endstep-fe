import styles from "./style.module.css";

export interface InviteLinkViewProps {
  code: string;
  url: string;
  copied: boolean;
  onCopy: () => void;
}

export function InviteLinkView({ code, url, copied, onCopy }: InviteLinkViewProps) {
  return (
    <button onClick={onCopy} title={url} className={styles.root}>
      {copied ? "link copiado ✓" : `↗ ${code}`}
    </button>
  );
}
