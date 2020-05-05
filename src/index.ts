import * as discord from "discord.js";
import { config } from "dotenv";

const client = new discord.Client();
config();

import { gifCommand, handleGifCommand } from "./commands/gif";
import { kickCommand, handleKickCommand } from "./commands/kick";
import {
  playCommand,
  handlePlayCommand,
  stopCommand,
  handleStopCommand,
} from "./commands/music";

client.once("ready", () => {
  console.log("Ready!");
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
client.once("disconnecting", () => {
  console.log("Disconnecting!");
});

client.on("message", async (message) => {
  if (message.content.startsWith(kickCommand)) await handleKickCommand(message);

  if (message.content.startsWith(gifCommand)) await handleGifCommand(message);

  if (message.content.startsWith(playCommand)) await handlePlayCommand(message);

  if (message.content.startsWith(stopCommand)) await handleStopCommand(message);
});

client.login(`${process.env.DISCORD_TOKEN}`);
