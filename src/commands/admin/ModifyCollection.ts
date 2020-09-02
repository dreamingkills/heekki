import { Message } from "discord.js";
import { AdminService } from "../../database/Admin";
import { AdminCommand } from "../../structures/command/AdminCommand";

export class Command extends AdminCommand {
  names: string[] = ["modifycollection"];
  usage: string[] = ["%c <cid> <property> <values>"];
  category: string = "admin";

  exec = async (msg: Message) => {
    if (msg.author.id != "197186779843919877") return;
    /*let opt = this.prm.slice(1);
    let collR = Collection.getRepository().createQueryBuilder();
    let coll = await Collection.findOne({
      where: { id: this.prm[0] },
      relations: [
        "imageData",
        "imageData.collectionText",
        "imageData.heartText",
        "imageData.levelNum",
        "imageData.levelText",
        "imageData.memberText",
        "imageData.serialText",
      ],
    });

    if (!coll || !collR) {
      msg.channel.send("Collection not found");
      return;
    }

    if (this.prm[1] == "Name") {
      let coll = collR
        .update(Collection)
        .set({ name: this.prm[2] })
        .where("id=:id", { id: this.prm[0] })
        .execute();
      return;
    }
    let txt = await AdminService.setText(
      opt[0],
      parseInt(opt[1]),
      opt[2],
      opt[3] as "left" | "right" | "center",
      parseInt(opt[4]),
      parseInt(opt[5]),
      opt[6]
    );
    if (!txt) {
      msg.channel.send("Invalid parameters");
      return;
    }
    console.log(txt);
    console.log(coll);
    switch (opt[6]) {
      case "CollectionText": {
        coll.imageData.collectionText = txt;
        break;
      }
      case "HeartText": {
        coll.imageData.heartText = txt;
        break;
      }
      case "LevelNum": {
        coll.imageData.levelNum = txt;
        break;
      }
      case "LevelText": {
        coll.imageData.levelText = txt;
        break;
      }
      case "MemberText": {
        coll.imageData.memberText = txt;
        break;
      }
      case "SerialText": {
        coll.imageData.serialText = txt;
        break;
      }
      default: {
        await msg.channel.send("Invalid type");
        return;
      }
    }
    console.log(coll);
    await coll.save();

    console.log(coll);
    msg.channel.send(
      `:white_check_mark: **Created new Collection** \`${coll!.name}\`\nID: ${
        coll!.id
      }`
    );
    return;*/
  };
}
