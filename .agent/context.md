# Contexto do Projeto

## Descrição
Aplicação web para "Raízes do Sul", uma boutique de massas e bolos artesanais. Contém um painel admin para cadastro de produtos e gestão de encomendas. A principal movimentação da aplicação são as encomendas (pedidos), enviadas inicialmente por email, com arquitetura pronta para futura integração com WhatsApp.

## Stack / Tecnologias
- Framework: Next.js (estável, App Router)
- Runtime: Bun
- Autenticação: NextAuth.js
- UI: shadcn/ui + Tailwind CSS
- Linguagem: TypeScript (strict mode)
- Fonte: Google Fonts (tipografia marcante e corpo refinado, sugerido DM Serif Display e Inter ou Outfit)

## Convenções e Padrões
- Princípios da Clean Architecture: Divisão em `app`, `components`, `domain`, `infrastructure`, `lib`, `actions`.
- Separation of Concerns: Server Actions para mutations, Components para UI, Domain para regras.
- Padronização de nomes: `PascalCase` para componentes, `kebab-case` para arquivos.
- Versionamento com `bun`, nada de `npm` ou `yarn`.
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
- As requisições de compra não precisam ser pagamentos online, apenas encomendas enviadas por email.

---

## Design

### Design System
Tailwind CSS + shadcn/ui customizado com tokens exclusivos.

### Tipografia
Display: Playfair Display (A ser configurado)
Corpo: Instrument Sans ou Inter (A ser configurado)

### Paleta de Cores
primary: `oklch(0.42 0.12 45)` (Terracota Profundo / Crosta de Bolo)
accent: `oklch(0.94 0.03 80)` (Trigo / Mel)
surface: `oklch(0.98 0.01 70)` (Creme / Farinha)
text: `oklch(0.25 0.04 45)` (Marrom Café / Cacau)

### Espaçamento e Grid
Escala de múltiplos de 4px, layout limpo com espaço negativo intencional.

### Componentes Base
Os componentes do shadcn/ui serão ajustados radicalmente para terem estética marcante e sem bordas arredondadas exageradamente. 

### Acessibilidade
WCAG AA, foco visível sempre, cores contrastantes.

### Animações e Transições
Framer motion (ou puramente CSS) para transições sutis em 200ms `ease-in-out` de hover, revelações nas telas e interação contínua.

### Breakpoints
sm: 640px, md: 768px, lg: 1024px, xl: 1280px

### Notas de Design
Evitar a estética "template de IA". Layout de e-commerce e admin com aspecto orgânico ou natural, compatível com a identidade da marca "Raízes do Sul".

---

## Histórico Visual

### Tema Completo - TC - v1
**Data:** 2026-03-09
**Motivo:** Definição da identidade visual "Padaria/Massaria Artesanal" (Massa e Bolo).

```json
{
  "primary": "oklch(0.42 0.12 45)",
  "accent": "oklch(0.94 0.03 80)",
  "background": "oklch(0.98 0.01 70)",
  "foreground": "oklch(0.25 0.04 45)",
  "radius": "0.75rem"
}
```

### Componentes - K - v1
**Data:** 2026-03-09
**Motivo:** Suavização dos cantos (border-radius) para uma estética mais acolhedora e artesanal.

---

## Histórico de Decisões
[2026-03-09] Setup — Next.js 15, shadcn/ui, Neon + Prisma definidos como arquitetura.
[2026-03-09] Prisma Fix - Instanciação do driver adapter `PrismaNeon` modificada para receber `PoolConfig` direto ao invés de uma instância instanciada com `new Pool()` para suportar versões do Prisma >7 e adaptadores Neon atualizados.
[2026-03-09] Prisma Fix - Instalado o pacote `@prisma/client` e rodado o npx prisma generate para resolver erro de tipo do PrismaClient ausente.
[2026-03-09] Design — Substituição da vibe "Fazenda/Orgânico" por "Massas/Bolos Artesanais".
[2026-03-09] Feature — Implementação do fluxo completo de Encomendas (Page, Form, Server Action).
[2026-03-10] TypeScript — Eliminação de todos os `any` implícitos no projeto: criadas interfaces `OrderItemWithProduct`, `TopItem`, `OrderWithItems`, `OrderItem`; convertidos `Decimal` do Prisma para `string` no mapeamento de produtos; asserção `as any` em `createOrder` substituída por tipo explícito do Prisma; `bun tsc --noEmit` passou com zero erros.