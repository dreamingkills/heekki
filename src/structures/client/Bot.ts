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
import { Chance } from "chance";
import { PlayerService } from "../../database/service/PlayerService";
import { HeartSpawner } from "../../helpers/HeartSpawner";
import version from "../../version.json";

export class Bot extends Client {
  public config: Object = config;
  public cmdMan: CommandManager = new CommandManager();
  public chance: Chance.Chance = new Chance();

  public async updateStatus() {
    const supporters = await PlayerService.getSupporters();
    const lucky = this.chance.pickone(supporters);

    this.user!.setPresence({
      activity: { name: `with cards - ❤️ ${lucky.name}`, type: "PLAYING" },
    });

    setTimeout(async () => this.updateStatus(), 900000);
  }

  public async init() {
    await this.cmdMan.init();

    this.on("ready", async () => {
      if (!this.user) return console.error("I'm null!");

      console.log(`[ Heekki v${version.version} ] - Connected to Discord.`);
      this.updateStatus();
    });

    this.on("message", async (msg: Message) => {
      if (
        (this.user!.id === "752291099170701384" &&
          msg.author.id !== "197186779843919877") ||
        msg.author.bot
      )
        return;
      if (msg.channel.type == "text") {
        await this.users.fetch(msg.author.id);
        this.cmdMan.handle(msg, config);
      }
    });

    this.on("guildMemberAdd", async (m: GuildMember | PartialGuildMember) => {
      if (
        m.partial ||
        !m.guild.available ||
        m.guild.id != "752028821791703141" ||
        this.user!.id !== "741836734135926885"
      )
        return;

      /* Welcomer */
      const embed = new MessageEmbed()
        .setAuthor(`New Member | ${m.user.tag}`)
        .setDescription(
          `Welcome, ${m}!\nFeel free to ask any questions or leave <#752046973082665031>!`
        )
        .setThumbnail(m.user.displayAvatarURL())
        .setColor("#FFAFA6")
        .setFooter(`👋 Member #${m.guild.memberCount}`)
        .setTimestamp(Date.now());
      (<TextChannel>m.guild.channels.resolve("752028822274179145")!).send(
        embed
      );

      m.roles.add("753014710084960327");
    });

    process.on("unhandledRejection", (error) => {
      console.error(`Unhandled promise rejection: `, error);
    });
    this.login(config.discord.token);
  }
}
