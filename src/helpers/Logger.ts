import chalk from "chalk";
import { Message, TextChannel } from "discord.js";
import { BaseCommand } from "../structures/command/Command";
import { ClientError } from "../structures/Error";
import moment from "moment";

export class Logger {
  static log(command: BaseCommand, msg: Message, error?: ClientError): void {
    const params = msg.content
      .split(" ")
      .splice(1)
      .join(chalk`{white ,} `);
    const logString = [
      ``,
      chalk`{white ================} {hex('#ffbfbf') ${command.names[0]}} {white ================}`,
      chalk`{white  Run by:} {hex('#1fb7cf') ${msg.author.tag}} {white (${msg.author.id})}`,
      chalk`{white   Guild:} {hex('#1fb7cf') ${msg.guild!.name}} {white (${
        msg.guild!.id
      })}`,
      chalk`{white Channel:} {hex('#1fb7cf') #${
        (<TextChannel>msg.channel).name
      }} {white (${msg.channel.id})}`,
      ``,
      chalk`{white Raw:} {black {bgHex('#1fb7cf') ${msg.content}}}`,
    ];

    //Parameters
    if (params.length > 0)
      logString.push(chalk`{white Parameters:} {hex('#1fb7cf') ${params}}`);

    //Time
    logString.push(
      chalk`{white Staged at} {hex('#1fb7cf') ${moment(Date.now()).format(
        "HH:mm:ss[.]SSSS MMMM Do YYYY"
      )}}`
    );

    //Ending
    logString.push(
      chalk`{white ${"=".repeat(32 + 2 + command.names[0].length)}}`,
      ``
    );

    if (error) logString.push(``, chalk`{red Error: ${error.message}}`);

    console.log(logString.join("\n"));
  }
}
