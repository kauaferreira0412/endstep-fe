import styles from "./style.module.css";

interface DialogReqView {
  kind: "prompt" | "confirm" | "alert";
  title?: string;
  message: string;
  placeholder?: string;
  okLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface DialogsViewProps {
  current: DialogReqView | null;
  value: string;
  onValueChange: (v: string) => void;
  onCancel: () => void;
  onOk: () => void;
}

export function DialogsView({ current, value, onValueChange, onCancel, onOk }: DialogsViewProps) {
  if (!current) return null;

  return (
    <div className={styles.overlay} onMouseDown={onCancel}>
      <div className={styles.card} onMouseDown={(e) => e.stopPropagation()}>
        {current.title && <h2 className={styles.title}>{current.title}</h2>}
        <p className={`${styles.message} ${current.title ? styles.messageSpaced : ""}`}>
          {current.message}
        </p>

        {current.kind === "prompt" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onOk();
            }}
          >
            <input
              autoFocus
              className={styles.input}
              value={value}
              placeholder={current.placeholder}
              onChange={(e) => onValueChange(e.target.value)}
            />
          </form>
        )}

        <div className={styles.actions}>
          {current.kind !== "alert" && (
            <button className={styles.btn} onClick={onCancel}>
              {current.cancelLabel ?? "Cancelar"}
            </button>
          )}
          <button
            className={`${styles.btn} ${current.danger ? styles.btnDanger : styles.btnPrimary}`}
            autoFocus={current.kind !== "prompt"}
            onClick={onOk}
          >
            {current.okLabel ?? "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
