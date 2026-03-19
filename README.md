# GraphQL Gateway Plugins

A modular **GraphQL API Gateway** built with a **plugin architecture** and **Redis caching**.

The goal of this project is to demonstrate how to design a scalable GraphQL gateway that aggregates multiple services while supporting extensible middleware via plugins.

## Features

* GraphQL API Gateway
* Plugin-based middleware system
* Redis caching layer
* DataLoader batching
* Service aggregation
* Clean modular architecture
* TypeScript support

## Tech Stack

* Node.js
* GraphQL
* Apollo Server
* Redis
* DataLoader
* TypeScript

## Project Structure

## Project Structure

```
.
├── src
│   ├── server.ts          # Application entrypoint (GraphQL server bootstrap)
│
│   ├── schema             # GraphQL schema definitions
│   │
│   ├── resolvers          # GraphQL resolver implementations
│   │
│   ├── services           # External service integrations (REST APIs, microservices)
│   │
│   ├── loaders            # DataLoader implementations for batching & caching
│   │
│   ├── cache              # Redis caching layer and cache utilities
│   │
│   ├── plugins            # Gateway plugin system (middleware-style extensions)
│   │
│   └── utils              # Shared utilities and helper functions
│
├── package.json
├── tsconfig.json
└── README.md
```

### Architecture Overview

The gateway follows a modular architecture:

* **Resolvers** orchestrate data fetching.
* **Services** communicate with external APIs or databases.
* **Loaders** prevent the GraphQL N+1 problem using batching.
* **Plugins** extend gateway behavior (authentication, caching, rate limiting).
* **Cache layer** provides Redis-backed query caching.

```
Client
│
GraphQL Gateway
│
├── Plugins (auth, rate limit, logging)
├── Cache Layer (Redis)
├── DataLoader
│
└── External Services
├── Users API
└── Posts API
```

## Running Locally

Install dependencies

    npm install

Run development server

    npm run dev

Open GraphQL Playground

    http://localhost:4000

## Running with Docker

Start all services (GraphQL API + Redis):

    docker-compose up --build

GraphQL API will be available at:

    http://localhost:4000

Redis runs on:

    localhost:6379

## Planned Features

* Redis query caching
* Rate limiting plugin
* Authentication plugin
* Query complexity protection
* Observability / logging plugin
* GraphQL federation support
