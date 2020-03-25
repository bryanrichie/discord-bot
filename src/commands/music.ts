import * as discord from "discord.js";
import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";

export const playCommand = `${process.env.PREFIX}play`;
export const skipCommand = `${process.env.PREFIX}skip`;
export const stopCommand = `${process.env.PREFIX}stop`;
export const queueCommand = `${process.env.PREFIX}queue`;

function isUrl(value: string) {
  const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(value);
}

export async function handlePlayCommand(message: discord.Message) {
  const query = message.content.substring(playCommand.length).trim();
  let songLink;

  if (isUrl(query)) {
    songLink = query;
  } else {
    const opts = {
      maxResults: 5,
      key: `${process.env.YOUTUBE_TOKEN}`,
      type: "video"
    };
    const results = await youtubeSearch(query, opts);

    if (results) {
      const youtubeResults = results.results;
      const titles = youtubeResults.map((result, index) => {
        return `${index + 1}) ${result.title}`;
      });

      message.channel.send({
        embed: {
          title: "Song selection. Type the song number to continue.",
          description: titles.join("\n")
        }
      });

      const filter = (m: any) => m.author.id === message.author.id;
      const songChoice = await message.channel.awaitMessages(filter, {
        max: 1
      });

      songLink = youtubeResults[parseInt(songChoice.first().content) - 1].link;
    }
  }
  if (!songLink) {
    return await message.channel.send("Unable to find a song link!");
  }

  const voiceChannel = message.member.voiceChannel;

  if (!voiceChannel) {
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);

  if (
    permissions &&
    (!permissions.has("CONNECT") || !permissions.has("SPEAK"))
  ) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  //  here we try to join the voice chat and save our connection into our object
  const connection = await voiceChannel.join();

  connection.playStream(ytdl(songLink));
}

export async function handleStopCommand(message: discord.Message) {
  const voiceChannel = message.member.voiceChannel;

  if (!voiceChannel) {
    return message.channel.send(
      "You need to be in a voice channel to stop the music!"
    );
  } else {
    await voiceChannel.leave();
  }
}
