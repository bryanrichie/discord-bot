import * as discord from "discord.js";
import * as youtubeSearch from "youtube-search";
import * as ytdl from "ytdl-core";

export const playCommand = `${process.env.PREFIX}play`;
export const skipCommand = `${process.env.PREFIX}skip`;
export const stopCommand = `${process.env.PREFIX}stop`;
export const queueCommand = `${process.env.PREFIX}queue`;

export async function handlePlayCommand(message: discord.Message) {
  console.log("hello");
  const query = message.content.substring(playCommand.length).trim();
  console.log(query);
  const opts = {
    maxResults: 5,
    key: `${process.env.YOUTUBE_TOKEN}`,
    type: "video"
  };
  const results = await youtubeSearch(query, opts);
  console.log(results);

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
    const collected = await message.channel.awaitMessages(filter, {
      max: 1
    });

    const selected = youtubeResults[parseInt(collected.first().content) - 1];
  }
}
