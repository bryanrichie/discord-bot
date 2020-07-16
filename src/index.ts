import * as discord from "discord.js";
import { config } from "dotenv";
import * as _ from "lodash";
import { gifCommands, handleGifCommand } from "./commands/gif";
import {
  joinCommands,
  handleJoinCommand,
  playCommands,
  handlePlayCommand,
  searchCommands,
  handleSearchCommand,
  stopCommands,
  handleStopCommand,
  skipCommands,
  handleSkipCommand,
  queueCommands,
  handleQueueCommand,
  leaveCommands,
  handleLeaveCommand,
} from "./commands/music";

config();

const prefixes = ["/", "!"];

function handleCommand(
  message: discord.Message,
  commands: string[],
  fn: (message: discord.Message, query: string) => void
): void {
  const prefix = message.content.charAt(0);
  const commandToRun = _.find(commands, (command) => {
    const withoutPrefix = message.content.substr(1);
    const parsedCommand = _.head(withoutPrefix.split(" "));
    return parsedCommand === command;
  });

  if (!_.includes(prefixes, prefix) || !commandToRun) {
    return;
  }
  const query = message.content.substr(commandToRun.length + 1).trim();
  return fn(message, query);
}

const client = new discord.Client();

client.once("ready", () => {
  console.log("Ready!");
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
client.once("disconnecting", () => {
  console.log("Disconnecting!");
});
client.on("message", (message) => {
  if (message.author.bot) return;
});

client.on("message", async (message) => {
  const commands = [
    { commands: gifCommands, handle: handleGifCommand },
    { commands: joinCommands, handle: handleJoinCommand },
    { commands: playCommands, handle: handlePlayCommand },
    { commands: searchCommands, handle: handleSearchCommand },
    { commands: stopCommands, handle: handleStopCommand },
    { commands: queueCommands, handle: handleQueueCommand },
    { commands: skipCommands, handle: handleSkipCommand },
    { commands: leaveCommands, handle: handleLeaveCommand },
  ];
  return _.each(commands, (item) =>
    handleCommand(message, item.commands, item.handle)
  );
});

client.login(`${process.env.DISCORD_TOKEN}`);
