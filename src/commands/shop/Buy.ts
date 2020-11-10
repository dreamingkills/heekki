import { Message, MessageEmbed } from "discord.js";
import { ShopService } from "../../database/service/ShopService";
import { CardService } from "../../database/service/CardService";
import moment from "moment";
import { BaseCommand } from "../../structures/command/Command";
import { Profile } from "../../structures/player/Profile";
import Chance from "chance";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends BaseCommand {
  names: string[] = ["buypack", "bp"];
  async exec(msg: Message, executor: Profile) {
    const packName = this.options.join(" ");
    if (!packName) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} Please enter a pack to purchase from.`
      );
      return;
    }
    const pack = await ShopService.getPackByName(packName);
    if (!pack.active) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} That pack isn't available for purchase.`
      );
      return;
    }
    if (pack.price > executor.coins) {
      await msg.channel.send(
        `${this.config.discord.emoji.cross.full} You don't have enough coins to buy that.`
      );
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
      [61.3, 42.7, 25.7, 6.5, 2.1, 0.22]
    );

    const newCard = await UserCardService.createNewUserCard(
      executor,
      randomCard,
      starCount,
      0,
      false,
      pack.price
    );

    //const imageData = await CardService.getImageDataFromCard(newCard);
    /*const image = await CardService.generateCardImageFromUserCard(
      newCard,
      imageData
    );*/
    let embed = new MessageEmbed()
      .setAuthor(`You rolled the ${pack.title} pack and got...`)
      .setDescription(
        `${this.config.discord.emoji.cards.full} **${newCard.member}** #${
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
      )
      .setThumbnail(`attachment://card.png`);

    //embed.attachFiles([{ name: "card.png", attachment: image }]);

    await msg.channel.send(embed);
  }
}
