# dekachichibato-image-bot

メッセージに「でかちちばと」が含まれていたら、画像を返信する Discord bot。

カタカナ・半角カナ・ローマ字入力などの表記揺れも拾う（NFKC 正規化 + ひらがな化してから判定）。

## セットアップ

```bash
bun install
cp .env.sample .env.local   # DISCORD_TOKEN と IMAGE_PATH を埋める
```

Discord Developer Portal の Bot 設定で **MESSAGE CONTENT INTENT** を有効にする。無効のままだとメッセージ本文が空で届き、反応しない。

## bot の招待

`DISCORD_CLIENT_ID` を埋めた以下の URL で招待する。

```
https://discord.com/oauth2/authorize?client_id=<DISCORD_CLIENT_ID>&scope=bot&permissions=101376
```

scope は `bot` のみ（スラッシュコマンドを使っていないので `applications.commands` は不要）。
`permissions=101376` は以下の合計。

| 権限                 | 値    | 必要な理由                                          |
| -------------------- | ----- | --------------------------------------------------- |
| View Channels        | 1024  | チャンネルのメッセージを受け取る                    |
| Send Messages        | 2048  | 返信を送る                                          |
| Attach Files         | 32768 | 画像を添付する                                      |
| Read Message History | 65536 | 返信（message reference）の対象メッセージを参照する |

## 開発

```bash
bun run dev        # ファイル監視付きで起動
bun start          # 通常起動
bun run typecheck  # 型チェック
bun fmt            # フォーマット（--check で確認のみ）
```

`main` 向けの PR では `bun fmt --check` と型チェックが CI で走る。

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
DISCORD_TOKEN=xxx docker compose up -d
```

amd64 / arm64 両対応なので、Oracle Cloud A1 などの arm でもそのまま動く。

レジストリを使わない場合は Release assets の `dekachichibato-image-bot-<tag>-<arch>.tar.gz` を `docker load -i` で読み込む。

## リリース

```bash
bun pm version patch   # minor / major / 1.2.3 も可
git push --follow-tags
```

`bun pm version` が package.json のバージョンを上げ、コミットと `v*` タグを作る。
タグを push すると `.github/workflows/release.yml` が以下を実行する。

1. GitHub Release を pre-release として自動生成
2. amd64 / arm64 の image を GHCR に push し、tar を Release assets に添付
3. `:<tag>` と `:latest` の manifest list を作成

## 環境変数

| 変数                | 必須 | 説明                                                                    |
| ------------------- | ---- | ----------------------------------------------------------------------- |
| `DISCORD_TOKEN`     | ○    | Bot のトークン                                                          |
| `IMAGE_PATH`        | ○    | 返信に添付する画像のパス（デフォルトの `./image.png` は同梱していない） |
| `DISCORD_CLIENT_ID` |      | 招待 URL の生成に使う（コードからは未使用）                             |

画像は起動時に一度だけ読み込む。見つからなければその時点で起動に失敗する。
