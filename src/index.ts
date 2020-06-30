import * as discord from "discord.js";
import { config } from "dotenv";

const client = new discord.Client();
config();

import { gifCommand, handleGifCommand } from "./commands/gif";
import { kickCommand, handleKickCommand } from "./commands/kick";
import {
  joinCommand,
  handleJoinCommand,
  playCommand,
  handlePlayCommand,
  stopCommand,
  handleStopCommand,
  skipCommand,
  handleSkipCommand,
  leaveCommand,
  handleLeaveCommand,
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
  if (message.content.startsWith(joinCommand)) await handleJoinCommand(message);
  if (message.content.startsWith(playCommand)) await handlePlayCommand(message);
  if (message.content.startsWith(stopCommand)) await handleStopCommand(message);
  if (message.content.startsWith(skipCommand)) await handleSkipCommand(message);
  if (message.content.startsWith(leaveCommand))
    await handleLeaveCommand(message);
});

client.login(`${process.env.DISCORD_TOKEN}`);
