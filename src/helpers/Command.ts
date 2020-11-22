import { BaseCommand } from "../structures/command/Command";
import config from "../../config.json";
import glob from "glob";
import { Message, MessageEmbed } from "discord.js";
import { promisify } from "util";
import { PlayerService } from "../database/service/PlayerService";
import * as error from "../structures/Error";
import { Logger } from "../helpers/Logger";
import { ConcurrencyService } from "./Concurrency";
import { Bot } from "../structures/client/Bot";

export class CommandManager {
  commands: BaseCommand[] = [];
  cooldown: Set<string> = new Set<string>();
  warned: Set<string> = new Set<string>();

  constructor() {}
  async init(): Promise<BaseCommand[]> {
    let globp = promisify(glob);
    let files = await globp(
      `${require("path").dirname(require.main?.filename)}/commands/**/*.js`
    );
    for (let file of files) {
      let current = require(file);
      if (current.Command) {
        let cmd = new current.Command() as BaseCommand;
        if (cmd.disabled) continue;
        cmd.description = cmd.description.replace(
          /\$EMOJI_CASH\$/g,
          config.discord.emoji.cash.full
        );
        this.commands.push(cmd);
      }
    }
    return this.commands;
  }

  private getCommandByName(
    message: string,
    prefix: string
  ): BaseCommand | undefined {
    let expr = new RegExp(
      `^(${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(\\S+)`,
      "g"
    ).exec(message);
    if (expr) {
      for (let command of this.commands) {
        if (command.names.includes(expr[0].slice(prefix.length)))
          return command;
      }
    }
  }

  async handle(msg: Message, cfg: typeof config, bot: Bot): Promise<void> {
    let cmd = this.getCommandByName(
      msg.content.toLowerCase(),
      bot.getPrefix(msg.guild?.id)
    );
    if (!cmd) return;

    if (!msg.guild?.member(msg.client.user!)?.hasPermission("SEND_MESSAGES"))
      return;
    if (this.cooldown.has(msg.author.id)) {
      if (!this.warned.has(msg.author.id)) {
        this.warned.add(msg.author.id);
        await msg.channel.send(
          `${cfg.discord.emoji.cross.full} Please wait a couple seconds before using another command.`
        );
      }
      return;
    }

    if (cmd.users && cmd.users[0] !== msg.author.id) {
      await msg.channel.send(
        `${cfg.discord.emoji.cross.full} You don't have access to that command.`
      );
      return;
    }

    const staged = Date.now();
    this.cooldown.add(msg.author.id);
    setTimeout(() => {
      this.warned.delete(msg.author.id);
      this.cooldown.delete(msg.author.id);
    }, 1500);

    try {
      const profile = await PlayerService.getProfileByDiscordId(
        msg.author.id,
        true
      );
      if (profile.restricted) throw new error.RestrictedUserError();

      let err;

      await cmd.run(msg, profile, bot).catch(async (e) => {
        err = e;
        if (e.isClientFacing) {
          const errorEmbed = new MessageEmbed()
            .setAuthor(
              `${e.header} | ${msg.author.tag}`,
              msg.author.displayAvatarURL()
            )
            .setDescription(`${cfg.discord.emoji.cross.full} ${e.message}`)
            .setColor(`#FFAACC`);
          await msg.channel.send(errorEmbed);
        } else if (
          err.name === "Internal Server Error" ||
          err.name === "Service Unavailable" ||
          err.name === "FetchError"
        ) {
          ConcurrencyService.flushConcurrency();
          await msg.channel.send(
            `${cfg.discord.emoji.cross.full} Sorry, Discord seems to be having some problems right now. Please try again in a moment.`
          );
        } else {
          ConcurrencyService.flushConcurrency();
          await msg.channel.send(
            `${cfg.discord.emoji.cross.full} **An unexpected error occurred**: ${e.name} - ${e.message}\nPlease report this error to the developer.`
          );
        }
      });
      Logger.log(cmd, msg, staged, err);
    } catch (e) {}
  }
}
