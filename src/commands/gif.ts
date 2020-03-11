import * as discord from "discord.js";
import * as gphApiClient from "giphy-js-sdk-core";

const giphy = gphApiClient(process.env.GIPHY_TOKEN);

export const gifCommand = `${process.env.PREFIX}gif`;

export function randomiseGifResponse(gifResponse: any) {
  const totalGifs = gifResponse.data.length;
  const randomIndex = Math.floor(Math.random() * 10 + 1) % totalGifs;
  return gifResponse.data[randomIndex];
}

export async function handleGifCommand(message: discord.Message) {
  const query = message.content.substring(gifCommand.length).trim();

  if (!query) {
    const randomGif = randomiseGifResponse(
      await giphy.search("gifs", { q: "random" })
    );
    message.channel.send({
      files: [randomGif.images.fixed_height.url]
    });
  } else {
    const gifQueryResult = randomiseGifResponse(
      await giphy.search("gifs", { q: query })
    );

    message.channel.send({
      files: [gifQueryResult.images.fixed_height.url]
    });
  }
}
