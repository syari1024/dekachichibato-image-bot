# dekachichibato-image-bot

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To type check:

```bash
bun check
```

Run `bun fmt` to format the code.

## Release

```bash
bun pm version patch   # minor / major / 1.2.3 も可
git push --follow-tags
```

`bun pm version` が package.json のバージョンを上げ、コミットと `v*` タグを作る。
タグを push すると `.github/workflows/release.yml` が GitHub Release（pre-release）を自動生成する。

This project was created using `bun init` in bun v1.4.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
