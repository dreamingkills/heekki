import { Bot } from "./structures/client/Bot";
import { DB } from "./sql/index";
import "reflect-metadata";

Promise.all([DB.connect()]).then(() => {
  new Bot().init();
});
