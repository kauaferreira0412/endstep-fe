import { create } from "zustand";

type DialogKind = "prompt" | "confirm" | "alert";

interface DialogReq {
  kind: DialogKind;
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  okLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  resolve: (value: string | boolean | null) => void;
}

interface DialogState {
  current: DialogReq | null;
  open: (req: Omit<DialogReq, "resolve">) => Promise<string | boolean | null>;
  settle: (value: string | boolean | null) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  current: null,
  open: (req) =>
    new Promise((resolve) => {
      // se já houver um diálogo aberto, resolve o anterior como cancelado
      get().current?.resolve(get().current?.kind === "confirm" ? false : null);
      set({ current: { ...req, resolve } });
    }),
  settle: (value) => {
    const cur = get().current;
    set({ current: null });
    cur?.resolve(value);
  },
}));

/** Substitutos de window.prompt / confirm / alert com o estilo do sistema. */
export const dialog = {
  prompt: (opts: {
    title?: string;
    message: string;
    defaultValue?: string;
    placeholder?: string;
    okLabel?: string;
  }): Promise<string | null> =>
    useDialogStore.getState().open({ kind: "prompt", ...opts }) as Promise<string | null>,

  confirm: (opts: {
    title?: string;
    message: string;
    okLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }): Promise<boolean> =>
    useDialogStore.getState().open({ kind: "confirm", ...opts }).then((v) => v === true),

  alert: (opts: { title?: string; message: string; okLabel?: string }): Promise<void> =>
    useDialogStore.getState().open({ kind: "alert", ...opts }).then(() => undefined),
};
