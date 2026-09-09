import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";

const COLORS: [string, string][] = [
  ["W", "Branco"],
  ["U", "Azul"],
  ["B", "Preto"],
  ["R", "Vermelho"],
  ["G", "Verde"],
];

/** Formulário para criar fichas (tokens) no campo de batalha. */
export function TokenModal() {
  const open = useGameStore((s) => s.tokenModalOpen);
  const setOpen = useGameStore((s) => s.setTokenModalOpen);
  const createToken = useGameStore((s) => s.createToken);

  const [name, setName] = useState("");
  const [pt, setPt] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [count, setCount] = useState(1);

  if (!open) return null;

  function reset() {
    setName("");
    setPt("");
    setColors([]);
    setText("");
    setCount(1);
  }

  function submit() {
    if (!name.trim()) return;
    createToken({
      name: name.trim(),
      pt: pt.trim() || undefined,
      colors: colors.join("") || undefined,
      text: text.trim() || undefined,
      count: Math.max(1, Math.min(20, count)),
    });
    reset();
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-sm animate-fade-in p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Criar ficha</h2>
          <button
            className="text-xs text-ink-faint hover:text-ink"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            fechar
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-[11px] text-ink-dim">Nome</span>
            <input
              autoFocus
              className="input mt-1 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex.: Soldado, Tesouro, Besta 3/3"
            />
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-[11px] text-ink-dim">Poder/Resist. (P/T)</span>
              <input
                className="input mt-1 w-full"
                value={pt}
                onChange={(e) => setPt(e.target.value)}
                placeholder="ex.: 1/1"
              />
            </label>
            <label className="block w-20">
              <span className="text-[11px] text-ink-dim">Quantas</span>
              <input
                type="number"
                min={1}
                max={20}
                className="input mt-1 w-full"
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </label>
          </div>

          <div>
            <span className="text-[11px] text-ink-dim">Cores</span>
            <div className="mt-1 flex gap-1">
              {COLORS.map(([c, label]) => (
                <button
                  key={c}
                  title={label}
                  onClick={() =>
                    setColors((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))
                  }
                  className={`h-7 w-7 rounded-full text-xs font-bold ${
                    colors.includes(c) ? "bg-brand text-white" : "bg-bg-elev text-ink-dim"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] text-ink-dim">Texto (opcional)</span>
            <textarea
              className="input mt-1 w-full"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ex.: Voar, vigilância"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={!name.trim()} onClick={submit}>
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
