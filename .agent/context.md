# Contexto do Projeto

## Descrição
Aplicação web para "Raízes do Sul", uma boutique de massas e bolos artesanais. Contém um painel admin para cadastro de produtos e gestão de encomendas. A principal movimentação da aplicação são as encomendas (pedidos), enviadas inicialmente por email, com arquitetura pronta para futura integração com WhatsApp.

## Stack / Tecnologias
- Framework: Next.js (App Router)
- Runtime: Bun
- Autenticação: NextAuth.js
- UI: shadcn/ui + Tailwind CSS + Base UI
- Linguagem: TypeScript (strict mode)
- Animações: Framer Motion
- Banco de Dados: PostgreSQL (Neon) + Prisma
- APIs: WhatsApp (Direct Linking), AbacatePay (Draft)

## Convenções e Padrões
- Princípios da Clean Architecture: Divisão em `app`, `components`, `domain`, `infrastructure`, `lib`, `actions`.
- Separation of Concerns: Server Actions para mutations, Components para UI, Domain para regras.
- Padronização de nomes: `PascalCase` para componentes, `kebab-case` para arquivos.
- Versionamento com `bun`, nunca `npm` ou `yarn`.
- Cursor styles restritos: uso de `cursor-pointer`, `cursor-not-allowed`, etc. explícitos.
- Nenhum componente ou página com "Cara de IA".

## Notas Importantes
- Priorizar estética de "Design System": design minimalista refinado, com espaçamentos fluidos, escalas equilibradas, sem clichês (ex: roxo, azul "tech").
- Todas as alterações visuais devem ser listadas no histórico visual.

---

## Banco de Dados

### Banco
PostgreSQL (via Neon serverless)

### ORM / Query Builder
Prisma

### Convenções de Migration
Tabelas e colunas em snake_case no banco de dados, camelCase no TypeScript via map() ou @@map() no schema do Prisma.

### Estrutura Principal
- `Product`: cadastro de produtos
- `Order`: gerenciamento de encomendas

### Notas de Banco
- As requisições de compra não precisam ser pagamentos online, apenas encomendas enviadas por email/WhatsApp.

---

## Design

### Design System
Tailwind CSS + shadcn/ui customizado com tokens exclusivos. Utiliza Base UI para componentes de overlay/dropdown por flexibilidade de estilo.

### Tipografia
- Display: Playfair Display / DM Serif Display
- Corpo: Instrument Sans / Inter / Outfit

### Paleta de Cores
- **primary**: `oklch(0.42 0.12 45)` (Terracota Profundo / Crosta de Bolo)
- **accent**: `oklch(0.94 0.03 80)` (Trigo / Mel)
- **surface**: `oklch(0.98 0.01 70)` (Creme / Farinha)
- **text**: `oklch(0.25 0.04 45)` (Marrom Café / Cacau)

### Espaçamento e Grid
Escala de múltiplos de 4px, layout limpo com espaço negativo intencional. Max-width expandido para 1600px em telas largas.

### Componentes Base
Os componentes do shadcn/ui são ajustados para uma estética marcante, orgânica e artesanal, evitando bordas arredondadas exageradas (padrão boutique).

### Acessibilidade
WCAG AA, foco visível sempre, cores contrastantes, labels semânticos.

---

## Histórico Visual

### Tema Completo - TC - v1
**Data:** 2026-03-09
**Motivo:** Definição da identidade visual "Padaria/Massaria Artesanal".
```json
{
  "primary": "oklch(0.42 0.12 45)",
  "accent": "oklch(0.94 0.03 80)",
  "background": "oklch(0.98 0.01 70)",
  "foreground": "oklch(0.25 0.04 45)",
  "radius": "0.75rem"
}
```

### Componentes - K - v2
**Data:** 2026-03-15
**Motivo:** Refatoração do fluxo de encomendas para multi-step (Store-like) com Framer Motion.
- Passo 1: Seleção com barra flutuante de subtotal.
- Passo 2: Checkout com resumo lateral e formulários limpos.
- Passo 3: Feedback de sucesso.

### Tema Completo - TC - v2
**Data:** 2026-03-15
**Motivo:** Overhaul Premium (Wide Layout).
- Expandido `max-width` para `1600px`.
- `Select` de pagamento redesenhado: maior (`h-20`), bordas acentuadas (`2rem`).
- Sidebar de sacola independente com scroll interno e radius de `3rem`.

### Componentes - K - v3
**Data:** 2026-03-15
**Motivo:** Centralização e Redesign do Checkout.
- Card de resumo centralizado com tipografia de subtotal ampliada (`text-5xl`).
- Layout do checkout em fluxo centralizado para melhor hierarquia visual.

### Componentes - K - v4
**Data:** 2026-03-15
**Motivo:** Refatoração do Header e Dashboard.
- Header unificado: removidos links redundantes, integrado menu de usuário com avatar.
- Dashboard Admin: resumo operacional com cards dinâmicos e tipografia premium.
- Lógica de autenticação integrada à UI para ocultar botões de login quando logado.

### Tema Completo - TC - v3
**Data:** 2026-03-15
**Motivo:** Overhaul Visual Final (Home & Admin).
- Hero section redesenhada com tipografia display escalonada e animações de entrada.
- Grid de produtos em destaque com cards de "boutique" (radius acentuado, sombras suaves).
- Rodapé refinado com grid de navegação e informações de contato.
- Aplicação de `backdrop-blur` e `glassmorphism` em elementos flutuantes.

### Revisão Visual - TC - v4
**Data:** 2026-03-15
**Motivo:** Ajuste de escala e visibilidade (Feedback do Usuário).
- Reduzida a escala da tipografia do Hero (de `9xl` para `8xl`) para melhor equilíbrio.
- Aumentada a opacidade do logo de fundo (de `0.03` para `0.12`) e removido blur para maior clareza.
- Reduzido o tamanho da descrição no Hero para aumentar o respiro visual.

### Ajuste de Branding - TC - v5
**Data:** 2026-03-15
**Motivo:** Reposicionamento de marca (não é boutique).
- Remoção do termo "Boutique" de descrições, footer e copyright.
- Substituição por "Massas Artesanais" e "Produção Artesanal".
- Correção de endereço para "RS - Brasil".

### Revisão Hero - TC - v6
**Data:** 2026-03-15
**Motivo:** Refinamento de leitura e visibilidade da marca d'água (Feedback do Usuário).
- Título principal reduzido (agora vai até `7xl` em telas grandes, antes `8xl`).
- Descrição reduzida e mais compacta (agora `max-w-lg` e texto text-base a text-lg).
- Aumentada a opacidade do logo de background (de `0.12` para `0.18`).

---

## Histórico de Decisões
- [2026-03-09] Setup — Next.js 15, shadcn/ui, Neon + Prisma definidos como arquitetura.
- [2026-03-09] Prisma Fix — Instanciação do driver adapter `PrismaNeon` modificada para suportar Prisma >7.
- [2026-03-10] TypeScript — Eliminação de todos os `any` implícitos; criada tipagem rigorosa para pedidos e produtos.
- [2026-03-15] Feature — Implementação da gestão de encomendas e dashboard operacional.
- [2026-03-15] Navegação — Lógica de "Voltar" customizada no formulário para melhor UX mobile.
- [2026-03-15] Correção — Corrigido erro de tipagem `asChild` em `DropdownMenuTrigger`. Substituído pelo prop `render` (padrão Base UI).
- [2026-03-15] Design — Centralizado o resumo do checkout e aplicado redesign premium para melhor legibilidade e hierarquia.
- [2026-03-15] Admin — Dashboard e gestão operacional de pedidos finalizados.
- [2026-03-15] Interface — Criação da página pública de acompanhamento e tracking da encomenda pelo cliente (`/acompanhar/[id]`) com linha do tempo animada (Framer Motion).
- [2026-03-15] Auth — Implementação do `AuthProvider` (SessionProvider) e integração do estado de login no `Header` e `AdminLayout`.
- [2026-03-15] Arquitetura — Centralização de todas as Server Actions em `src/actions/` e proteção de rotas administrativas via checagem de sessão nas actions e no layout.
- [2026-03-15] Interface — Redesign completo do Header, unificando navegação desktop e mobile, e garantindo que o botão de login seja substituído pelo avatar do usuário logado.
- [2026-03-15] Design — Overhaul visual da página inicial (Home) e Dashboard Admin para uma estética de "Boutique Artesanal Premium", com animações Framer Motion e tipografia display impactante.
- [2026-03-15] UX — Melhoria na hierarquia visual e espaçamento de todas as seções principais da aplicação, eliminando a sensação de "bagunça" e amadurecendo a interface.
- [2026-03-15] Branding — Remoção completa do termo "Boutique" e ajuste de localização genérica conforme as especificações reais do negócio.
- [2026-03-15] Design — Redução adicional na tipografia principal do Hero para melhorar o respiro e aumento da transparência do logo de fundo para maior destaque visual.
- [2026-03-15] Auth Fix — Corrigido bug de sessão que não atualizava o Header após login sem F5. Removido `redirectTo` da server action `loginAction` e substituído por `redirect: false` + retorno de `{ success: true }`. O cliente agora usa `router.push("/")` + `router.refresh()` para navegar e forçar a re-hidratação da sessão no `SessionProvider`.
