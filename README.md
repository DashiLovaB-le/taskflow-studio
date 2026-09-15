# DashiTask (taskflow-studio)

UI de Tarefas e Eventos do Dono. Mesmo Supabase do Mr Joshua (`dashitask_*`). Fuso: America/Sao_Paulo.

Repo: [DashiLovaB-le/taskflow-studio](https://github.com/DashiLovaB-le/taskflow-studio)

## Local

```bash
cp .env.example .env
# preencha VITE_SUPABASE_ANON_KEY (anon JWT — nunca service_role)
npm install
npm run dev
```

## Vercel

Projeto Vite na raiz do repo. Build: `npm run build`. Output: `dist`. Node `>=20`.

Environment Variables (Production + Preview + Development) — obrigatórias no **build**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://gdcaxslhskxzcrbejxxo.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon JWT do projeto (Settings → API) |

Depois do primeiro deploy, no Supabase → Authentication → URL Configuration:

- **Site URL:** a URL da Vercel (`https://….vercel.app`)
- **Redirect URLs:** `https://SEU-PROJETO.vercel.app/**` (e `http://localhost:8080/**` para local)

Primeiro login na UI reivindica `dashitask_dono`. Evento ≠ Call.
