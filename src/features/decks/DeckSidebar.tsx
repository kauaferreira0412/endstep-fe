import { useMemo, useState } from "react";
import { useDeckStore } from "@/stores/deckStore";
import { dialog } from "@/stores/dialogStore";
import type { DeckSummary, Folder } from "@/types/deck";
import { ColorIdentity } from "./ManaCost";

interface TreeNode {
  folder: Folder;
  children: TreeNode[];
  decks: DeckSummary[];
}

function buildTree(folders: Folder[], decks: DeckSummary[]): { roots: TreeNode[]; looseDecks: DeckSummary[] } {
  const byId = new Map<number, TreeNode>();
  folders.forEach((f) => byId.set(f.id, { folder: f, children: [], decks: [] }));
  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    const p = node.folder.parentId;
    if (p != null && byId.has(p)) byId.get(p)!.children.push(node);
    else roots.push(node);
  });
  decks.forEach((d) => {
    if (d.folderId != null && byId.has(d.folderId)) byId.get(d.folderId)!.decks.push(d);
  });
  const looseDecks = decks.filter((d) => d.folderId == null || !byId.has(d.folderId));
  return { roots, looseDecks };
}

export function DeckSidebar({ onImport }: { onImport: () => void }) {
  const { folders, decks, formats, selectedDeckId, selectDeck, createFolder, createDeck } =
    useDeckStore();
  const { renameFolder, deleteFolder, deleteDeck, duplicateDeck, patchDeck } = useDeckStore();

  const { roots, looseDecks } = useMemo(() => buildTree(folders, decks), [folders, decks]);
  const [adding, setAdding] = useState<null | { kind: "folder" | "deck"; parentId: number | null }>(
    null,
  );
  const [draft, setDraft] = useState("");
  const [draftFormat, setDraftFormat] = useState("commander");

  async function submitAdd() {
    const name = draft.trim();
    if (!name || !adding) return setAdding(null);
    if (adding.kind === "folder") await createFolder(name, adding.parentId);
    else {
      const id = await createDeck(name, "commander", adding.parentId);
      await selectDeck(id);
    }
    setDraft("");
    setAdding(null);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-line p-2">
        <button
          className="btn btn-ghost flex-1 !py-1.5 text-xs"
          onClick={() => {
            setAdding({ kind: "folder", parentId: null });
            setDraft("");
          }}
        >
          ＋ Pasta
        </button>
        <button
          className="btn btn-ghost flex-1 !py-1.5 text-xs"
          onClick={() => {
            setAdding({ kind: "deck", parentId: null });
            setDraft("");
          }}
        >
          ＋ Deck
        </button>
        <button
          className="btn btn-ghost flex-1 !py-1.5 text-xs"
          onClick={onImport}
          title="Importar deck de uma lista de texto"
        >
          ↧ Importar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {adding && adding.parentId === null && (
          <AddRow
            kind={adding.kind}
            draft={draft}
            setDraft={setDraft}
            format={draftFormat}
            setFormat={setDraftFormat}
            formats={formats.map((f) => ({ code: f.code, name: f.name }))}
            onSubmit={submitAdd}
            onCancel={() => setAdding(null)}
          />
        )}

        {roots.map((node) => (
          <FolderNode
            key={node.folder.id}
            node={node}
            depth={0}
            selectedDeckId={selectedDeckId}
            onSelectDeck={selectDeck}
            addingParentId={adding?.parentId ?? undefined}
            adding={adding}
            draft={draft}
            setDraft={setDraft}
            draftFormat={draftFormat}
            setDraftFormat={setDraftFormat}
            formats={formats.map((f) => ({ code: f.code, name: f.name }))}
            onSubmitAdd={submitAdd}
            onStartAdd={(kind, parentId) => {
              setAdding({ kind, parentId });
              setDraft("");
            }}
            onCancelAdd={() => setAdding(null)}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
            onDeleteDeck={deleteDeck}
            onDuplicateDeck={duplicateDeck}
            onRenameDeck={(id, name) => patchDeck(id, { name })}
          />
        ))}

        {looseDecks.length > 0 && (
          <div className="mt-1">
            {looseDecks.map((d) => (
              <DeckRow
                key={d.id}
                deck={d}
                depth={0}
                selected={selectedDeckId === d.id}
                onSelect={() => selectDeck(d.id)}
                onDelete={() => deleteDeck(d.id)}
                onDuplicate={() => duplicateDeck(d.id)}
                onRename={(name) => patchDeck(d.id, { name })}
              />
            ))}
          </div>
        )}

        {roots.length === 0 && looseDecks.length === 0 && !adding && (
          <p className="px-2 py-6 text-center text-xs text-ink-faint">
            Sem pastas ou decks ainda.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------

function FolderNode(props: {
  node: TreeNode;
  depth: number;
  selectedDeckId: number | null;
  onSelectDeck: (id: number) => void;
  adding: null | { kind: "folder" | "deck"; parentId: number | null };
  addingParentId?: number;
  draft: string;
  setDraft: (s: string) => void;
  draftFormat: string;
  setDraftFormat: (s: string) => void;
  formats: { code: string; name: string }[];
  onSubmitAdd: () => void;
  onStartAdd: (kind: "folder" | "deck", parentId: number) => void;
  onCancelAdd: () => void;
  onRenameFolder: (id: number, name: string) => void;
  onDeleteFolder: (id: number) => void;
  onDeleteDeck: (id: number) => void;
  onDuplicateDeck: (id: number) => void;
  onRenameDeck: (id: number, name: string) => void;
}) {
  const { node, depth } = props;
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  const pad = { paddingLeft: 8 + depth * 14 };

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-md py-1 pr-1 text-sm hover:bg-bg-elev/60"
        style={pad}
      >
        <button className="text-ink-faint" onClick={() => setOpen((o) => !o)}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            className={`transition ${open ? "rotate-90" : ""}`}
          >
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </button>
        <span className="flex-1 truncate text-ink-dim">{node.folder.name}</span>
        <span className="text-[10px] text-ink-faint">{node.folder.deckCount || ""}</span>
        <div className="relative opacity-0 transition group-hover:opacity-100">
          <button className="px-1 text-ink-faint hover:text-ink" onClick={() => setMenu((m) => !m)}>
            ⋮
          </button>
          {menu && (
            <div
              className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-line bg-bg-elev p-1 text-xs shadow-pop"
              onMouseLeave={() => setMenu(false)}
            >
              <MenuItem onClick={() => { setMenu(false); props.onStartAdd("deck", node.folder.id); }}>
                Novo deck aqui
              </MenuItem>
              <MenuItem onClick={() => { setMenu(false); props.onStartAdd("folder", node.folder.id); }}>
                Nova subpasta
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  setMenu(false);
                  const n = await dialog.prompt({
                    title: "Renomear pasta",
                    message: "Novo nome da pasta:",
                    defaultValue: node.folder.name,
                  });
                  if (n && n.trim()) props.onRenameFolder(node.folder.id, n.trim());
                }}
              >
                Renomear
              </MenuItem>
              <MenuItem
                danger
                onClick={async () => {
                  setMenu(false);
                  const ok = await dialog.confirm({
                    title: "Excluir pasta",
                    message: `Excluir "${node.folder.name}" e tudo dentro dela?`,
                    okLabel: "Excluir",
                    danger: true,
                  });
                  if (ok) props.onDeleteFolder(node.folder.id);
                }}
              >
                Excluir
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      {open && (
        <>
          {props.adding && props.adding.parentId === node.folder.id && (
            <div style={{ paddingLeft: 8 + (depth + 1) * 14 }}>
              <AddRow
                kind={props.adding.kind}
                draft={props.draft}
                setDraft={props.setDraft}
                format={props.draftFormat}
                setFormat={props.setDraftFormat}
                formats={props.formats}
                onSubmit={props.onSubmitAdd}
                onCancel={props.onCancelAdd}
              />
            </div>
          )}
          {node.children.map((child) => (
            <FolderNode key={child.folder.id} {...props} node={child} depth={depth + 1} />
          ))}
          {node.decks.map((d) => (
            <DeckRow
              key={d.id}
              deck={d}
              depth={depth + 1}
              selected={props.selectedDeckId === d.id}
              onSelect={() => props.onSelectDeck(d.id)}
              onDelete={() => props.onDeleteDeck(d.id)}
              onDuplicate={() => props.onDuplicateDeck(d.id)}
              onRename={(name) => props.onRenameDeck(d.id, name)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function DeckRow(props: {
  deck: DeckSummary;
  depth: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
}) {
  const { deck, depth, selected } = props;
  const [menu, setMenu] = useState(false);
  return (
    <div
      className={`group flex items-center gap-1.5 rounded-md py-1 pr-1 text-sm ${
        selected ? "bg-brand/15 text-ink" : "text-ink-dim hover:bg-bg-elev/60"
      }`}
      style={{ paddingLeft: 8 + depth * 14 + 14 }}
    >
      <button className="flex flex-1 items-center gap-1.5 truncate text-left" onClick={props.onSelect}>
        <ColorIdentity ci={deck.colorIdentity} />
        <span className="truncate">{deck.name}</span>
        {deck.favorite && <span className="text-gold">★</span>}
      </button>
      <span className="text-[10px] text-ink-faint">{deck.cardCount}</span>
      <div className="relative opacity-0 transition group-hover:opacity-100">
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => setMenu((m) => !m)}>
          ⋮
        </button>
        {menu && (
          <div
            className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-line bg-bg-elev p-1 text-xs shadow-pop"
            onMouseLeave={() => setMenu(false)}
          >
            <MenuItem
              onClick={async () => {
                setMenu(false);
                const n = await dialog.prompt({
                  title: "Renomear deck",
                  message: "Novo nome do deck:",
                  defaultValue: deck.name,
                });
                if (n && n.trim()) props.onRename(n.trim());
              }}
            >
              Renomear
            </MenuItem>
            <MenuItem onClick={() => { setMenu(false); props.onDuplicate(); }}>Duplicar</MenuItem>
            <MenuItem
              danger
              onClick={async () => {
                setMenu(false);
                const ok = await dialog.confirm({
                  title: "Excluir deck",
                  message: `Excluir "${deck.name}"?`,
                  okLabel: "Excluir",
                  danger: true,
                });
                if (ok) props.onDelete();
              }}
            >
              Excluir
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function AddRow(props: {
  kind: "folder" | "deck";
  draft: string;
  setDraft: (s: string) => void;
  format: string;
  setFormat: (s: string) => void;
  formats: { code: string; name: string }[];
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="my-1 flex flex-col gap-1 rounded-md border border-brand/40 bg-bg-elev p-1.5">
      <input
        autoFocus
        className="input !py-1 text-xs"
        placeholder={props.kind === "folder" ? "Nome da pasta" : "Nome do deck"}
        value={props.draft}
        onChange={(e) => props.setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") props.onSubmit();
          if (e.key === "Escape") props.onCancel();
        }}
      />
      {props.kind === "deck" && (
        <div className="rounded-md border border-line bg-bg-input/60 px-2 py-1 text-[11px] text-ink-dim">
          ◈ Commander
        </div>
      )}
      <div className="flex gap-1">
        <button className="btn btn-primary flex-1 !py-1 text-xs" onClick={props.onSubmit}>
          Criar
        </button>
        <button className="btn flex-1 !py-1 text-xs" onClick={props.onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className={`block w-full rounded px-2 py-1.5 text-left hover:bg-bg-soft ${
        danger ? "text-danger" : "text-ink-dim"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
