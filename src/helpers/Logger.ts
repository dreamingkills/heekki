import chalk from "chalk";
import { Message } from "discord.js";
import { BaseCommand } from "../structures/command/Command";
import { ClientError } from "../structures/Error";

export class Logger {
  static log(command: BaseCommand, msg: Message, error?: ClientError): void {
    const logString = [
      chalk`{white ================} {hex('#ffbfbf') ${command.names[0]}} {white ================}`,
      ``,
      chalk`{white Run by:} {hex('#1fb7cf') ${msg.author.tag}} {white (${msg.author.id})}`,
      chalk`{white  Guild:} {hex('#1fb7cf') ${msg.guild!.name}} {white (${
        msg.guild!.id
      })}`,
      ``,
      chalk`{white Raw:} {black {bgHex('#1fb7cf') ${msg.content}}}`,
      chalk`{white Parameters:} {hex('#1fb7cf') ${msg.content
        .split(" ")
        .slice(1)
        .join(chalk`{white ,} `)}}`,
    ];

    if (error) logString.push(``, chalk`{red Error: ${error.message}}`);

    console.log(logString.join("\n"));
  }
}
