import glob from "glob";
import { promisify } from "util";
import canvas from "canvas";

export class FontLoader {
  static async init() {
    let globp = promisify(glob);
    let files = await globp(`./dist/src/assets/fonts/*`);
    console.log(files);
    for (let file of files) {
      console.log(file);
      console.log(file.split("/")[5].slice(0, -4));
      canvas.registerFont(file, { family: file.split("/")[5].slice(0, -4) });
    }
    return;
  }
}
