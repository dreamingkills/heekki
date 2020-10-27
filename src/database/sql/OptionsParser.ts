import { DB } from "..";

export class OptionsParser {
  public static async parsePlayerOptions(options?: {
    [key: string]: string | number;
  }): Promise<string[]> {
    let queryOptions = [];

    if (options?.pack)
      queryOptions.push(
        ` alphanum(pack.title) LIKE CONCAT("%",alphanum(${DB.connection.escape(
          options.pack
        )}),"%") OR alphanum(shop.title) LIKE CONCAT("%",alphanum(${DB.connection.escape(
          `${options.pack}`
        )}),"%")`
      );
    if (options?.member)
      queryOptions.push(
        ` alphanum(card.member) LIKE CONCAT("%",alphanum(${DB.connection.escape(
          options.member
        )}),"%")`
      );
    if (options?.minstars)
      queryOptions.push(
        ` user_card.stars>=${DB.connection.escape(options.minstars)}`
      );
    if (options?.maxstarsnoninclusive)
      queryOptions.push(
        ` user_card.stars<${DB.connection.escape(options.maxstarsnoninclusive)}`
      );
    if (options?.serial)
      queryOptions.push(
        ` user_card.serial_number=${DB.connection.escape(options.serial)}`
      );
    if (options?.stars)
      queryOptions.push(
        ` user_card.stars=${DB.connection.escape(options.stars)}`
      );
    if (options?.forsale === "true")
      queryOptions.push(` marketplace.price IS NOT NULL`);
    if (options?.favorite === "true")
      queryOptions.push(` user_card.is_favorite=1`);
    if (options?.favorite === "false" && options?.favorite !== undefined)
      queryOptions.push(` user_card.is_favorite=0`);

    return queryOptions;
  }
}
