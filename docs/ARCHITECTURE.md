# Architecture

## Layers

```text
adapters/http     → thin controllers, DTO validation, guards
application       → use cases + ports (interfaces)
domain            → entities, value objects, domain errors
infrastructure    → Better Auth, Prisma, future Redis/Kafka
```

## Dependency rule

```text
adapters → application → domain
infrastructure → application ports (implements)
```

Domain never imports NestJS, Prisma, Better Auth, Redis, or Kafka.

## Auth engine port

`AuthEnginePort` is the replaceable authentication boundary. Today it is implemented by `BetterAuthAdapter`. Tomorrow another engine could implement the same port without changing use cases or controllers.

## Why a wrapper API?

Better Auth is excellent as an engine, but exposing its native paths/SDK to every client would couple Flutter/Go/Python to Better Auth forever. This service owns the public contract:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET  /api/v1/auth/me`
- `GET  /.well-known/jwks.json`

## Prompt adjustments applied

| Original idea | Adjustment |
| --- | --- |
| Mount Better Auth as the public API | Public API is ours; Better Auth is internal |
| Full platform in one shot | Incremental phases (Phase 1 first) |
| Redis/Kafka in day one | Deferred to Phase 4 |
| Duplicate user/session tables for “our” domain | Reuse Better Auth schema; map to domain entities in the adapter |
| Custom OAuth provider port immediately | Phase 2 — start with Better Auth social providers + config DB |
