import { createConnection } from "typeorm";
import config from "../../config.json";

export class DB {
  static async connect() {
    let connection = await createConnection();

    await connection.synchronize();
  }
}
