import { Bot } from "./structures/client/Bot";
import { DB } from "./database/index";
import "reflect-metadata";

Promise.all([DB.connect()]).then(() => {
  new Bot().init();
});
