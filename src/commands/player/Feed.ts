import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageEmbed } from "discord.js";
import { CardService } from "../../database/service/CardService";

export class Command extends GameCommand {
  names: string[] = ["upgrade"];
  usage: string[] = ["%c <card reference> <amount>"];
  desc: string = "Adds hearts to a card, which can level it up.";
  category: string = "player";

  exec = async (msg: Message) => {
    let id = msg.author.id;
    let fedUserCardData = await CardService.upgradeCard(
      id,
      parseInt(this.prm[1]),
      {
        abbreviation: this.prm[0].split("#")[0],
        serial: parseInt(this.prm[0].split("#")[1]),
      }
    );
    let userCard = fedUserCardData.card;
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
        }** hearts to the following card:\n**__${userCard.abbreviation}#${
          userCard.serialNumber
        }__** - ${userCard.member}\n${"⭐".repeat(
          userCard.stars
        )}\n\nCard heart count: **${userCard.hearts + parseInt(this.prm[1])}**`
      )
      .setFooter(
        `You now have ${
          fedUserCardData.user.hearts - parseInt(this.prm[1])
        } hearts.`
      )
      .setColor("#40BD66");
    msg.channel.send(embed);
  };
}
