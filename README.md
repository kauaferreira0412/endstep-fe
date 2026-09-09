# endstep-fe

Frontend da **Endstep**. React 18 + TypeScript + Vite + Zustand.

## Rodar

```bash
npm install
npm run dev
```

→ `http://localhost:5174`. O Vite faz proxy de `/api` e `/actuator` para `http://localhost:8080`
(configurável via `VITE_API_TARGET`).

## Etapa 1 — telas

- **/cards** — busca de cartas (debounce, paginação) + painel de detalhe (imagem, texto,
  faces, legalidades, impressões, rulings).
- **/admin/sync** — dispara a sincronização com o Scryfall e acompanha o progresso.

## Estrutura

```
src/
  components/      Layout e UI compartilhada
  features/
    cards/         busca + grid + detalhe
    admin/         painel de sincronização
  services/api.ts  cliente HTTP
  stores/          estado (Zustand)
  types/           tipos compartilhados com a API
```

## Scripts

| Script | Ação |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + build de produção |
| `npm run typecheck` | Só o `tsc` |
