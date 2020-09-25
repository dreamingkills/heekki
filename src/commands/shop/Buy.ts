import { Message, MessageEmbed } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { CardService } from "../../database/service/CardService";
import moment from "moment";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import Chance from "chance";
import { UserCardService } from "../../database/service/UserCardService";
import { PlayerService } from "../../database/service/PlayerService";

export class Command extends BaseCommand {
  names: string[] = ["buy"];
  exec = async (msg: Message, executor: Profile) => {
    const packName = this.options.join(" ");
    if (!packName) {
      msg.channel.send(
        `<:red_x:741454361007357993> Please enter a pack to purchase from.`
      );
      return;
    }
    const pack = await ShopService.getPackByName(packName);
    if (!pack.active) {
      msg.channel.send(`:x: That pack isn't available for purchase.`);
      return;
    }
    if (pack.price > executor.coins) {
      msg.channel.send(`:x: You don't have enough coins to buy that.`);
      return;
    }

    const cardList = await CardService.getCardsByPack(pack);
    const chance = new Chance();
    const chances = cardList.map((c) => {
      return c.rarity > 3 ? c.rarity * 3.36 : c.rarity * 0.16;
    });
    const randomCard = chance.weighted(cardList, chances);
    const starCount = chance.weighted(
      [1, 2, 3, 4, 5, 6],
      [52.3, 31.7, 24.7, 13.1, 3.4, 0.54]
    );

    const newCard = await UserCardService.createNewUserCard(
      executor,
      randomCard,
      starCount,
      0
    );
    await PlayerService.removeCoinsFromProfile(executor, pack.price);

    const imageData = await CardService.getImageDataFromPack(pack);
    const image = await CardService.generateCardImageFromUserCard(
      newCard,
      imageData
    );
    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${pack.title} pack and got...`)
      .setDescription(
        `<:cards:757151797235286089> **${newCard.member}** #${
          newCard.serialNumber
        } ${"⭐".repeat(newCard.stars)}${
          newCard.blurb !== "" ? `\n*"${newCard.blurb}"*` : ``
        }`
      )
      .setColor("#FFAACC")
      .setFooter(
        `${newCard.abbreviation + "#" + newCard.serialNumber} • Rolled by ${
          msg.author.tag
        } on ${moment().format("MMMM Do YYYY [@] HH:mm:ss")}`
      );

    embed.attachFiles([{ name: "card.png", attachment: image }]);

    msg.channel.send(embed);
  };
}
