test
===
`@dooboostore/simple-boot-http-server-ssr-test` — SSR test app (same layout as example/): a `simple-boot-front` SPA rendered on the server by `SSRFilter` (jsdom, `poolOption: { max: 1, min: 1 }`), listening on port 8081 (`back-end/environments/environment.ts`).

```
test/
├── src/            # Shared (isomorphic) code: bootfactory.ts, pages/, component/, service/
├── front-end/      # Browser entry (index.ts, index.html, assets/)
├── back-end/       # Server entry (index.ts, root.router.ts, api/, service/, endpoints/, advices/)
└── types/
```

```bash
pnpm build     # frontend:build + backend:build (webpack)
pnpm start     # build, then node dist-back-end/index.js
pnpm watch     # frontend + backend webpack --watch
```

Note: the scripts expect `front-end/webpack.config.js` and `back-end/webpack.config.js`, which are not in this folder.
