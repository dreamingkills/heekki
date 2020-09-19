import { Message } from "discord.js";
import { AdminCommand } from "../../structures/command/AdminCommand";

export class Command extends AdminCommand {
  names: string[] = ["createcollection"];
  usage: string[] = ["%c <collection name>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;
    /*
    let coll = await AdminService.createNewCollection(this.prm.join(" "));

    msg.channel.send(
      `:white_check_mark: **Created new Collection** \`${coll.name}\`\nID: ${coll.id}`
    );*/
    return;
  };
}
