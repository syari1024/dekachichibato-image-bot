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

## Docker

画像はイメージに含めていないので、ホストからマウントする。

```yaml
# compose.yaml
services:
  bot:
    image: ghcr.io/syari1024/dekachichibato-image-bot:latest
    restart: unless-stopped
    environment:
      DISCORD_TOKEN: ${DISCORD_TOKEN:?}
      IMAGE_PATH: /app/dekachichibato.jpg
    volumes:
      - ./dekachichibato.jpg:/app/dekachichibato.jpg:ro
```

```bash
docker compose up -d
```

amd64 / arm64 両対応なので、Oracle Cloud A1 などの arm でもそのまま動く。
レジストリを使わない場合は Release assets の
`dekachichibato-image-bot-<tag>-<arch>.tar.gz` を `docker load -i` で読み込む。

## Release

```bash
bun pm version patch   # minor / major / 1.2.3 も可
git push --follow-tags
```

`bun pm version` が package.json のバージョンを上げ、コミットと `v*` タグを作る。
タグを push すると `.github/workflows/release.yml` が GitHub Release（pre-release）を自動生成し、
docker image を GHCR に push して tar を assets に添付する。

This project was created using `bun init` in bun v1.4.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
