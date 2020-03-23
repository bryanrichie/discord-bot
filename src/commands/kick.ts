import * as discord from "discord.js";
import * as gphApiClient from "giphy-js-sdk-core";

import { randomiseGifResponse } from "./gif";

const giphy = gphApiClient(process.env.GIPHY_TOKEN);

export const kickCommand = `${process.env.PREFIX}kick`;

export async function handleKickCommand(message: discord.Message) {
  if (!message.member.hasPermission(["KICK_MEMBERS", "BAN_MEMBERS"])) {
    message.channel.send(`You don't have sufficient permissions!`);
  } else {
    const member = message.mentions.members.first();
    await member.kick();
    const kickGifs = await giphy.search("gifs", { q: "kick" });
    const randomKickGif = randomiseGifResponse(kickGifs);

    message.channel.send(`:wave: ${member.displayName} has been kicked`, {
      files: [randomKickGif.images.fixed_height.url]
    });
  }
}
