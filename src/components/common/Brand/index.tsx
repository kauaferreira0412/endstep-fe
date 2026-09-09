import styles from "./style.module.css";

export interface BrandViewProps {
  size: number;
  withText: boolean;
  className: string;
}

export function BrandView({ size, withText, className }: BrandViewProps) {
  return (
    <span className={`${styles.root} ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="8" fill="#232343" stroke="#3d3d6c" />
        <path
          d="M16 6l8 10-8 10-8-10 8-10z"
          stroke="#a78bfa"
          strokeWidth="1.6"
          fill="#a78bfa"
          fillOpacity="0.14"
        />
        <path d="M16 6v20" stroke="#a78bfa" strokeWidth="1.6" strokeDasharray="2.5 3" />
      </svg>
      {withText && <span className={styles.text}>ENDSTEP</span>}
    </span>
  );
}
