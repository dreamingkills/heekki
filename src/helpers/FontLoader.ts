import glob from "glob";
import { promisify } from "util";
import canvas from "canvas";

export class FontLoader {
  static async init() {
    let globp = promisify(glob);
    let files = await globp(`./dist/src/assets/fonts/*`);
    for (let file of files) {
      canvas.registerFont(file, { family: file.split("/")[5].slice(0, -4) });
    }
    return;
  }
}
