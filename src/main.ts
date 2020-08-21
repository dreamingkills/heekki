import { Bot } from "./structures/client/Bot";
import { DB } from "./database/index";
import { FontLoader } from "./helpers/FontLoader";
import "reflect-metadata";

Promise.all([DB.connect(), FontLoader.init()]).then(() => {
  new Bot().init();
});
