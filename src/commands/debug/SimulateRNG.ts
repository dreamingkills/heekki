import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";
import { Chance } from "chance";

export class Command extends BaseCommand {
  names: string[] = ["sim"];
  usage: string[] = ["%c <number>"];
  desc: string = "Simulates X card generations.";
  category: string = "debug";
  hidden: boolean = true;

  exec = async (msg: Message) => {
    if (msg.author.id !== "197186779843919877") {
      msg.channel.send("You aren't allowed to use that.");
      return;
    }
    const loopTime = parseInt(this.options[0]);
    if (isNaN(loopTime)) {
      msg.channel.send("Enter a valid number.");
      return;
    }
    console.log(loopTime);
    const chance = new Chance();
    let rolls = {
      num1: 0,
      num2: 0,
      num3: 0,
      num4: 0,
      num5: 0,
      num6: 0,
    };
    const now = Date.now();

    for (let i = 0; i < loopTime; i++) {
      const starCount = chance.weighted(
        [1, 2, 3, 4, 5, 6],
        [50, 30, 20, 11.5, 3.8, 1.11]
      );
      rolls[`num${starCount}` as keyof typeof rolls] += 1;
    }

    const after = Date.now();
    msg.channel.send(
      `Generated **${
        rolls.num1 +
        rolls.num2 +
        rolls.num3 +
        rolls.num4 +
        rolls.num5 +
        rolls.num6
      }** cards. Results:\n1 :star:: **${rolls.num1}**\n2 :star:: **${
        rolls.num2
      }**\n3 :star:: **${rolls.num3}**\n4 :star:: **${
        rolls.num4
      }**\n5 :star:: **${rolls.num5}**\n6 :star:: **${rolls.num6}**\n\nTook **${
        after - now
      }**ms.`
    );
  };
}
