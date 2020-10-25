import { BaseCommand } from "../structures/command/Command";
import config from "../../config.json";
import glob from "glob";
import { Message } from "discord.js";
import { promisify } from "util";
import { PlayerService } from "../database/service/PlayerService";
import * as error from "../structures/Error";
import { Logger } from "../helpers/Logger";

export class CommandManager {
  commands: BaseCommand[] = [];
  cooldown: Set<string> = new Set<string>();

  constructor() {}
  async init(): Promise<BaseCommand[]> {
    let globp = promisify(glob);
    let files = await globp(
      `${require("path").dirname(require.main?.filename)}/commands/**/*.js`
    );
    for (let file of files) {
      let current = require(file);
      if (current.Command) {
        let cmd = new current.Command();
        if (cmd.disabled) continue;
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

  async handle(msg: Message): Promise<void> {
    let cmd = this.getCommandByName(msg.content.toLowerCase(), config.prefix);
    if (!cmd) return;
    if (cmd.users && cmd.users[0] !== msg.author.id) {
      msg.channel.send(
        `<:red_x:741454361007357993> You don't have access to that command.`
      );
      return;
    }
    if (this.cooldown.has(msg.author.id)) {
      await msg.channel.send(
        "<:red_x:741454361007357993> Please wait a couple seconds before using another command."
      );
      return;
    }

    const staged = Date.now();
    this.cooldown.add(msg.author.id);
    setTimeout(() => {
      this.cooldown.delete(msg.author.id);
    }, 1500);

    try {
      const profile = await PlayerService.getProfileByDiscordId(
        msg.author.id,
        true
      );
      if (profile.restricted) throw new error.RestrictedUserError();

      let err;
      await cmd.run(msg, profile).catch(async (e) => {
        err = e;
        if (e.isClientFacing) {
          await msg.channel.send(`<:red_x:741454361007357993> ${e.message}`);
        } else
          await msg.channel.send(
            `<:red_x:741454361007357993> **An unexpected error occurred**: ${e.name} - ${e.message}\nPlease report this error to the developer.`
          );
      });
      Logger.log(cmd, msg, staged, err);
    } catch (e) {}
  }
}
