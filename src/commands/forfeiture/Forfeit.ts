import { GameCommand } from "../../structures/command/GameCommand";
import { Message, MessageReaction, User } from "discord.js";
import { CardService } from "../../database/service/CardService";
import { UserCardService } from "../../database/service/UserCardService";

export class Command extends GameCommand {
  names: string[] = ["forfeit", "ff"];
  usage: string[] = ["%c <card reference>"];
  desc: string =
    "Removes a card from your inventory, making it available to anyone.";
  category: string = "card";

  exec = async (msg: Message) => {
    const reference = {
      abbreviation: this.prm[0].split("#")[0],
      serial: parseInt(this.prm[0].split("#")[1]),
    };
    let card = (await CardService.getCardDataFromReference(reference)).userCard;

    let conf = await msg.channel.send(
      `:warning: Really forfeit **${card.abbreviation}#${card.serialNumber}**?\nThis action is **irreversible**. React to this message with :white_check_mark: to confirm.`
    );
    conf.react("✅");
    let filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name == "✅" && user.id == msg.author.id;
    };
    let reactions = await conf.awaitReactions(filter, {
      max: 1,
      time: 10000,
    });
    let rxn = reactions.first();

    if (rxn) {
      await UserCardService.forfeitCard(msg.author.id, card);

      conf.edit(
        `:white_check_mark: You forfeited **${card.abbreviation}#${card.serialNumber}**.`
      );
    } else {
      conf.edit(
        `<:red_x:741454361007357993> You did not react in time, so the forfeiture has been cancelled.`
      );
    }
    conf.reactions.removeAll();
  };
}
