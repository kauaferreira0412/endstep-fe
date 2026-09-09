import type { ReactNode } from "react";
import styles from "./style.module.css";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={styles.label}>
        {label}
        {hint && <span className={styles.labelHint}>· {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={styles.toggle}>
      <span>
        <span className={styles.toggleTitle}>{title}</span>
        <span className={styles.toggleHint}>{hint}</span>
      </span>
      <span className={`${styles.switch} ${checked ? styles.switchOn : ""}`}>
        <span className={`${styles.knob} ${checked ? styles.knobOn : ""}`} />
      </span>
    </button>
  );
}

export interface CreateRoomModalViewProps {
  name: string;
  maxPlayers: number;
  allowSpectators: boolean;
  isPublic: boolean;
  password: string;
  loading: boolean;
  error: string | null;
  onNameChange: (v: string) => void;
  onMaxPlayersChange: (n: number) => void;
  onAllowSpectatorsChange: (v: boolean) => void;
  onIsPublicChange: (v: boolean) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function CreateRoomModalView({
  name,
  maxPlayers,
  allowSpectators,
  isPublic,
  password,
  loading,
  error,
  onNameChange,
  onMaxPlayersChange,
  onAllowSpectatorsChange,
  onIsPublicChange,
  onPasswordChange,
  onSubmit,
  onClose,
}: CreateRoomModalViewProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>◈</span>
            <div>
              <h2 className={styles.title}>Nova sala</h2>
              <p className={styles.subtitle}>Configure a mesa e compartilhe o link</p>
            </div>
          </div>
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <Field label="Nome da sala">
            <input
              className={styles.control}
              placeholder="Sexta Magic"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              autoFocus
            />
          </Field>

          <Field label="Formato">
            <div className={styles.formatBox}>
              <span className={styles.formatIcon}>◈</span>
              Commander
              <span className={styles.formatNote}>100 cartas · singleton</span>
            </div>
          </Field>

          <Field label="Jogadores">
            <div className={styles.seatGroup}>
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onMaxPlayersChange(n)}
                  className={`${styles.seat} ${maxPlayers === n ? styles.seatActive : ""}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <div className={styles.toggleList}>
            <Toggle
              checked={allowSpectators}
              onChange={onAllowSpectatorsChange}
              title="Permitir espectadores"
              hint="Quem entrar além do limite assiste a partida"
            />
            <Toggle
              checked={isPublic}
              onChange={onIsPublicChange}
              title="Sala pública"
              hint="Aparece na lista de salas pra qualquer um entrar"
            />
          </div>

          <Field label="Senha" hint="opcional">
            <input
              className={styles.control}
              type="password"
              placeholder="deixe vazio para sala aberta"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </Field>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.primary} onClick={onSubmit} disabled={loading}>
            {loading ? "Criando…" : "Criar e abrir sala"}
          </button>
          <button className={styles.secondary} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
