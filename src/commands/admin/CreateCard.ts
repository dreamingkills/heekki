import { Message } from "discord.js";
import { BaseCommand } from "../../structures/command/Command";

export class Command extends BaseCommand {
  names: string[] = ["createcard"];
  usage: string[] = [
    "%c <imageUrl> <member> <rarity> <collectionId> <credit> <abbr>",
  ];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;

    /*let [url, member, rarity, collectionId, credit, abbr] = this.prm;
    let card = await AdminService.createNewCard(
      url,
      member,
      rarity,
      collectionId,
      credit,
      abbr
    );

    console.log(card);
    msg.channel.send(
      `:white_check_mark: **Created new Card** \`${card.member}\`\nCollection: ${card.collection.name}\nID: ${card.id}`
    );
    return;*/
  };
}
