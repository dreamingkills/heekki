import { CommandManager } from "../../helpers/Command";
import config from "../../../config.json";
import {
  Client,
  Message,
  GuildMember,
  PartialGuildMember,
  MessageEmbed,
  TextChannel,
} from "discord.js";
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
      this.user.setPresence({ activity: { name: "with cards - !help" } });
    });

    this.on("message", async (msg: Message) => {
      if (msg.channel.type == "text") this.cmdMan.handle(msg);
    });

    this.on("guildMemberAdd", async (m: GuildMember | PartialGuildMember) => {
      if (m.partial || !m.guild.available || m.guild.id != "752028821791703141")
        return;

      /* Welcomer */
      const embed = new MessageEmbed()
        .setAuthor(`New Member | ${m.user.tag}`)
        .setDescription(
          `Welcome, ${m}!\nPlease read <#752050389632811059> for information on how to play.`
        )
        .setThumbnail(m.user.displayAvatarURL())
        .setColor("#FFAFA6")
        .setFooter(`👋 Member #${m.guild.memberCount}`)
        .setTimestamp(Date.now());
      (<TextChannel>m.guild.channels.resolve("752028822274179145")!).send(
        embed
      );
    });
    this.login(config.botToken);
  }
}
