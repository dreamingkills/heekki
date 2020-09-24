import { Pool, createPool, QueryOptions } from "mysql";
import config from "../../config.json";
import { promisify } from "util";
import sqlstring from "sqlstring";

export class DB {
  public static query: <T>(
    arg1: string | QueryOptions,
    values?: any
  ) => Promise<unknown>;
  public static connection: Pool;
  static async connect() {
    let pool = createPool(config.mysql);
    let q = promisify(pool.query).bind(pool);

    this.query = q;
    this.connection = pool;
  }
}

export class DBClass {
  public static clean(data: string | number): string {
    return sqlstring.escape(data);
  }
  public static cleanMention(data: string): string {
    return data.replace(/[\\<>@#&!]/g, "");
  }
}
