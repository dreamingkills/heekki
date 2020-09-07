import { CommandManager } from "../../helpers/Command";
import config from "../../../config.json";
import { Client, Message } from "discord.js";
import { DB } from "../../database/index";

export class Bot extends Client {
  public config: Object = config;
  public cmdMan: CommandManager = new CommandManager();

  public async init() {
    await this.cmdMan.init();

    this.on("ready", async () => {
      if (!this.user) return console.error("I'm null!");
      let userCount = await DB.query(
        `SELECT COUNT(discord_id) FROM user_profile;`
      );
      console.log(
        `Ready - ${userCount[0]["COUNT(discord_id)"]} users in database`
      );
    });
    this.on("message", async (msg: Message) => {
      if (msg.channel.type == "text") this.cmdMan.handle(msg);
    });

    this.login(config.botToken);
  }
}
