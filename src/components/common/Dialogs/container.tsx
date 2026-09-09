import { useEffect, useState } from "react";
import { useDialogStore } from "@/stores/dialogStore";
import { DialogsView } from "./index";

export function Dialogs() {
  const current = useDialogStore((s) => s.current);
  const settle = useDialogStore((s) => s.settle);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(current?.defaultValue ?? "");
  }, [current]);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(current.kind === "confirm" ? false : null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, settle]);

  const cancel = () => settle(current?.kind === "confirm" ? false : null);
  const ok = () =>
    settle(current?.kind === "prompt" ? value : current?.kind === "confirm" ? true : null);

  return (
    <DialogsView
      current={current}
      value={value}
      onValueChange={setValue}
      onCancel={cancel}
      onOk={ok}
    />
  );
}
