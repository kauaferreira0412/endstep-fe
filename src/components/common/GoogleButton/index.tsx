import styles from "./style.module.css";

export interface GoogleButtonViewProps {
  label: string;
}

export function GoogleButtonView({ label }: GoogleButtonViewProps) {
  return (
    <a href="/oauth2/authorization/google" className={styles.root}>
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c11.4 0 20.7-8.3 20.7-21 0-1.2-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.1 42.3 16 45 24 45z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.3 5.2C40.9 41.9 45 36.5 45 30c0-1.2-.1-2.3-1.4-9.5z"
        />
      </svg>
      {label}
    </a>
  );
}
