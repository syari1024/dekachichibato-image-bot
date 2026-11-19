import {
  Client,
  GatewayDispatchEvents,
  GatewayIntentBits,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { basename } from "node:path";
import { isIncludedDekachichibato } from "./search";

const token = process.env.DISCORD_TOKEN!;

// 起動時に一度だけ読む。無ければここで落ちる（fail fast）
const imagePath = process.env.IMAGE_PATH ?? "./image.png";
const image = {
  name: basename(imagePath),
  data: await Bun.file(imagePath).bytes(),
};

const rest = new REST({ version: "10" }).setToken(token);
const gateway = new WebSocketManager({
  token,
  intents:
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages,
  rest,
});
const client = new Client({ rest, gateway });
// login
client.once(GatewayDispatchEvents.Ready, (ready) => {
  console.log(`Logged in as ${ready.data.user.username}`);
});

// message handling
client.on(GatewayDispatchEvents.MessageCreate, async ({ data, api }) => {
  if (data.author.bot) return;
  if (isIncludedDekachichibato(data.content)) {
    // 計測用（仮）: 元メッセージ投稿→受信の遅延と、送信APIの所要時間
    const received = Date.now();
    const start = performance.now();
    await api.channels.createMessage(data.channel_id, {
      message_reference: { message_id: data.id },
      files: [image],
    });
    console.log(
      `gateway: ${received - Date.parse(data.timestamp)}ms, send: ${(performance.now() - start).toFixed(0)}ms`,
    );
  }
});

// error handling
process.on("unhandledRejection", (e) => console.error("unhandledRejection", e));
process.on("uncaughtException", (e) => console.error("uncaughtException", e));

// graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down`);
  await gateway.destroy();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

await gateway.connect();
