import { BaseCommand } from "../structures/command/Command";
import config from "../../config.json";
import glob from "glob";
import { Message } from "discord.js";
import { promisify } from "util";

export class CommandManager {
  commands: BaseCommand[] = [];

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
        this.commands.push({ ...cmd });
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
    let cmd = this.getCommandByName(msg.content, config.prefix);
    if (!cmd) return;
    if (cmd.role) {
      let role = await msg.guild?.roles.fetch(cmd.role);
      if (!role)
        return console.log(`Command ${cmd.names[0]} has an invalid role set.`);
      if (!msg.member?.roles.cache.get(cmd.role)) {
        await msg.channel.send(`:x: You need \`${role.name}\` to use that.`);
        return;
      }
    }
    try {
      return await cmd.run(msg);
    } catch (e) {
      msg.channel.send(`<:red_x:741454361007357993> ${e.message}`);
      return console.log(`${e.message}\n${e.stack}`);
    }
  }
}
