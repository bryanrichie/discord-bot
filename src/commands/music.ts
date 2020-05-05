import * as discord from "discord.js";
import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";

export const playCommand = `${process.env.PREFIX}play`;
export const stopCommand = `${process.env.PREFIX}stop`;

export async function handlePlayCommand(message: discord.Message) {
  const query = message.content.substring(playCommand.length).trim();
  const validate = await ytdl.validateURL(query);

  if (!message.member.voiceChannel)
    return message.channel.send(
      `Please connect to a voice channel for me to play music!`
    );
  if (
    message.guild.me.voiceChannel &&
    message.guild.me.voiceChannel !== message.member.voiceChannel
  )
    return message.channel.send(`Sorry, I'm currently being used already!`);
  if (!query)
    return message.channel.send(
      `Please provide me a URL of what you want me to play!`
    );
  if (!validate)
    return message.channel.send(
      `Please provide me a VALID URL of what you want me to play!`
    );

  const info = await ytdl.getInfo(query);
  const connection = await message.member.voiceChannel.join();
  const dispatcher = await connection.playStream(
    ytdl(query, { filter: "audioonly" })
  );

  message.channel.send(`Now playing: ${info.title}`);
}

export async function handleStopCommand(message: discord.Message) {
  if (!message.guild.me.voiceChannel)
    return message.channel.send(`I'm not currently playing any music!`);
  if (
    !message.member.voiceChannel ||
    message.member.voiceChannel !== message.guild.me.voiceChannel
  )
    return message.channel.send(
      `You have to be in my voice channel to stop the music!`
    );
  message.guild.me.voiceChannel.leave();
  message.channel.send(`Stopping music, see you next time!`);
}
