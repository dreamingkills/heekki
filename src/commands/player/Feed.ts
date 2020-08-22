import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/Card";

export class Command extends GameCommand {
  names: string[] = ["upgrade"];
  usage: string[] = ["%c <card> <amount>"];
  desc: string = "Adds hearts to a card, which can level it up.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let fedUserCardData = await CardService.upgradeCard(
      id,
      this.prm[0],
      parseInt(this.prm[1])
    );
    let userCard = fedUserCardData.card;
    let cardEntity = userCard.card;
    let beforeLevel = CardService.heartsToLevel(fedUserCardData.before).level;
    let afterLevel = CardService.heartsToLevel(userCard.hearts).level;

    let embed = new MessageEmbed()
      .setAuthor(`Successfully upgraded card!`, msg.author.displayAvatarURL())
      .setDescription(
        `${
          afterLevel > beforeLevel
            ? `:tada: **LEVEL UP!**\n${beforeLevel} ~~-->~~ ${afterLevel}\n\n`
            : ``
        } Successfully added **${
          this.prm[1]
        }** hearts to the following card:\n**${cardEntity.collection.name}#${
          userCard.serialNumber
        }** - ${cardEntity.member}\n${"⭐".repeat(
          userCard.stars
        )}\n\nCard heart count: **${userCard.hearts}**\nYou now have **${
          fedUserCardData.user.hearts
        }** hearts.`
      )
      .setColor("#40BD66")
      .setThumbnail(cardEntity.imageUrl);
    await msg.channel.send(embed);
    return;
  };
}
