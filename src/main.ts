import { Bot } from "./structures/client/Bot";
import { DB } from "./database/index";
import { FontLoader } from "./helpers/FontLoader";
// import { main } from "./api/index";

Promise.all([DB.connect(), FontLoader.init() /*main()*/]).then(() => {
  new Bot().init();
});
