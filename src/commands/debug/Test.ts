import { BaseCommand } from "../../structures/command/Command";
import { Message } from "discord.js";
import { Chance } from "chance";
import { createCanvas, loadImage } from "canvas";
import gifencoder from "gifencoder";
import fs from "fs";
import { encode } from "punycode";

export class Command extends BaseCommand {
  names: string[] = ["gif"];
  users: string[] = ["197186779843919877"];
  exec = async (msg: Message) => {
    const encoder = new gifencoder(420, 600);
    encoder
      .createReadStream()
      .pipe(
        fs.createWriteStream(
          "https://cdn.discordapp.com/attachments/742044748298190908/752513564413263872/chuu-cosmo-royale-gif.gif"
        )
      );

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1);
    encoder.setQuality(10);

    const canvas = createCanvas(420, 600);
    const ctx = canvas.getContext("2d");

    // red rectangle
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 700, 1000);
    ctx.font = "80px Impact";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("heejin", 350, 200);
    ctx.font = "80px Impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("overlaying text on a gif woo", 375, 200);
    encoder.addFrame(ctx);

    // green rectangle
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(0, 0, 700, 1000);
    ctx.font = "80px Impact";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("heejin", 350, 200);
    ctx.font = "80px Impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("i can change it too", 375, 200);
    encoder.addFrame(ctx);

    // blue rectangle
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, 0, 700, 1000);
    ctx.font = "80px Impact";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("heejin", 350, 200);
    ctx.font = "80px Impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("aaewrtcaerwtewatcerws", 375, 200);
    encoder.addFrame(ctx);

    encoder.finish();

    const buffer = canvas.toBuffer();

    await msg.channel.send({ files: ["cardpacks/earth.gif"] });
  };
}
