import chalk from "chalk";
import { Message, TextChannel } from "discord.js";
import { BaseCommand } from "../structures/command/Command";
import stripAnsi from "strip-ansi";
import moment from "moment";
import version from "../version.json";
import { ClientError } from "../structures/Error";
import "fs";
import { createWriteStream } from "fs";
import through = require("through2");

export class Logger {
  static stream = createWriteStream("./error-file.txt", { flags: "a" });

  static log(
    command: BaseCommand,
    msg: Message,
    staged: number,
    error?: any
  ): void {
    const now = Date.now();
    const params = msg.content
      .split(" ")
      .splice(1)
      .join(chalk`{white ,} `);
    let logString = [
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
      chalk`{white  Staged:} {hex('#1fb7cf') ${moment(staged).format(
        "HH:mm:ss[.]SSS MMMM Do YYYY"
      )}}`,
      chalk`{white  Finish:} {hex('#1fb7cf') ${moment(now).format(
        "HH:mm:ss[.]SSS MMMM Do YYYY"
      )}}`,
      chalk`{white Elapsed:} {hex('#1fb7cf') ${now - staged}}{white ms}`,
      ``,
      chalk`{white     Raw:} {black {bgHex('#1fb7cf') ${msg.content}}}`,
    ];

    //Parameters
    if (params.length > 0)
      logString.push(chalk`{white Options:} {hex('#1fb7cf') ${params}}`);

    //Errors
    if (
      error &&
      !error.isClientFacing &&
      error.message !== "Unknown Message" &&
      error.message !== "Missing Permissions"
    )
      logString.push(
        ``,
        chalk`{red Error: ${error.name + " - " + error.message}}${
          error.stack ? `\nStack: ${error.stack}` : ""
        }`
      );

    const longest = Math.max(...logString.map((e) => stripAnsi(e).length));
    logString[1] = chalk`{white =} {hex('#ffbfbf') ${
      command.names[0]
    }} {white ${"=".repeat(longest - 3 - command.names[0].length)}}`;

    const versionLength = 11 + version.version.length;
    const final = [
      ...logString,
      chalk`{white ${"=".repeat(longest - versionLength)} Heekki v${
        version.version
      } =}`,
    ].join("\n");

    if (error && !error.isClientFacing && error.message !== "Unknown Message") {
      this.stream.write(stripAnsi(final));
      console.error(final);
    } else console.log(final);
  }
}
