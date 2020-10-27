import { ServiceDefaults } from "@loopback/boot";
import { serialize } from "v8";
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
    if (options?.stars) {
      console.log(options.stars);
      if (options.stars.toString().startsWith(">")) {
        queryOptions.push(
          ` user_card.stars>${DB.connection.escape(
            options.stars.toString().slice(1)
          )}`
        );
      } else if (options.stars.toString().startsWith("<")) {
        queryOptions.push(
          ` user_card.stars<${DB.connection.escape(
            options.stars.toString().slice(1)
          )}`
        );
      } else
        queryOptions.push(
          ` user_card.stars=${DB.connection.escape(options.stars)}`
        );
    }
    if (options?.serial) {
      if (options.serial.toString().startsWith(">")) {
        queryOptions.push(
          ` user_card.serial_number>${DB.connection.escape(
            options.serial.toString().slice(1)
          )}`
        );
      } else if (options.serial.toString().startsWith("<")) {
        queryOptions.push(
          ` user_card.serial_number<${DB.connection.escape(
            options.serial.toString().slice(1)
          )}`
        );
      } else
        queryOptions.push(
          ` user_card.serial_number=${DB.connection.escape(options.serial)}`
        );
    }

    if (options?.forsale === "true")
      queryOptions.push(` marketplace.price IS NOT NULL`);
    if (options?.favorite === "true")
      queryOptions.push(` user_card.is_favorite=1`);
    if (options?.favorite === "false" && options?.favorite !== undefined)
      queryOptions.push(` user_card.is_favorite=0`);

    return queryOptions;
  }

  public static async parseMarketOptions(options?: {
    [key: string]: string | number;
  }): Promise<string[]> {
    let queryOptions: string[] = [];

    if (options?.price) {
      if (options.price.toString().startsWith("<")) {
        queryOptions.push(
          ` marketplace.price<${DB.connection.escape(
            options.price.toString().slice(1)
          )}`
        );
      } else if (options.price.toString().startsWith(">")) {
        queryOptions.push(
          ` marketplace.price>${DB.connection.escape(
            options.price.toString().slice(1)
          )}`
        );
      } else
        queryOptions.push(
          ` marketplace.price=${DB.connection.escape(options?.minprice)}`
        );
    }
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
    if (options?.serial)
      if (options.serial.toString().startsWith(">")) {
        queryOptions.push(
          ` user_card.serial_number>${DB.connection.escape(
            options.serial.toString().slice(1)
          )}`
        );
      } else if (options.serial.toString().startsWith("<")) {
        queryOptions.push(
          ` user_card.serial_number<${DB.connection.escape(
            options.serial.toString().slice(1)
          )}`
        );
      } else
        queryOptions.push(
          ` user_card.serial_number=${DB.connection.escape(options.serial)}`
        );
    if (options?.stars) {
      console.log(options.stars);
      if (options.stars.toString().startsWith(">")) {
        queryOptions.push(
          ` user_card.stars>${DB.connection.escape(
            options.stars.toString().slice(1)
          )}`
        );
      } else if (options.stars.toString().startsWith("<")) {
        queryOptions.push(
          ` user_card.stars<${DB.connection.escape(
            options.stars.toString().slice(1)
          )}`
        );
      } else
        queryOptions.push(
          ` user_card.stars=${DB.connection.escape(options.stars)}`
        );
    }
    if (options?.owner)
      queryOptions.push(
        ` user_card.owner_id=${DB.connection.escape(options.owner)}`
      );

    return queryOptions;
  }
}
