import { DB } from "..";

export class OptionsParser {
  private static checkOption(options: {
    [key: string]: string | number;
  }): { option: string; value: string } {
    const key = Object.keys(options)[0];
    const value = Object.values(options)[0];
    return { option: key, value: <string>value };
  }

  public static async parseOptions(
    type: "INVENTORY" | "MARKETPLACE",
    cardType: "user_card" | "legacy",
    options: {
      [key: string]: string | number;
    }[]
  ): Promise<string[]> {
    const queryOptions: string[] = [];
    for (let option of options) {
      const cleaned = this.checkOption(option);
      switch (cleaned.option) {
        case "stars": {
          if (cleaned.value.startsWith(">")) {
            queryOptions.push(
              ` user_card.stars>${DB.connection.escape(cleaned.value.slice(1))}`
            );
          } else if (cleaned.value.startsWith("<")) {
            queryOptions.push(
              ` user_card.stars<${DB.connection.escape(cleaned.value.slice(1))}`
            );
          } else
            queryOptions.push(
              ` user_card.stars=${DB.connection.escape(cleaned.value)}`
            );
          break;
        }
        case "member": {
          queryOptions.push(
            ` (alphanum(card.member) LIKE CONCAT("%",alphanum(${DB.connection.escape(
              cleaned.value
            )}),"%") OR alphanum(card.member) LIKE CONCAT("%",alphanum(${DB.connection.escape(
              `${cleaned.value}`
            )}),"%"))`
          );
          break;
        }
        case "pack": {
          queryOptions.push(
            ` (alphanum(pack.title) LIKE CONCAT("%",alphanum(${DB.connection.escape(
              cleaned.value
            )}),"%") OR alphanum(shop.title) LIKE CONCAT("%",alphanum(${DB.connection.escape(
              `${cleaned.value}`
            )}),"%"))`
          );
          break;
        }
        case "serial": {
          if (cleaned.value.startsWith(">")) {
            queryOptions.push(
              ` ${cardType}.serial_number>${DB.connection.escape(
                cleaned.value.slice(1)
              )}`
            );
          } else if (cleaned.value.startsWith("<")) {
            queryOptions.push(
              ` ${cardType}.serial_number<${DB.connection.escape(
                cleaned.value.slice(1)
              )}`
            );
          } else
            queryOptions.push(
              ` ${cardType}.serial_number=${DB.connection.escape(
                cleaned.value
              )}`
            );
          break;
        }
      }
      if (type === "INVENTORY") {
        switch (cleaned.option) {
          case "forsale": {
            if (cleaned.value === "false") {
              queryOptions.push(` marketplace.price IS NULL`);
            } else {
              queryOptions.push(` marketplace.price IS NOT NULL`);
            }
            break;
          }
          case "fav":
          case "favourite":
          case "favorite": {
            if (cleaned.value === "false") {
              queryOptions.push(` user_card.is_favorite=0`);
            } else {
              queryOptions.push(` user_card.is_favorite=1`);
            }
            break;
          }
        }
      }
      if (type === "MARKETPLACE") {
        switch (cleaned.option) {
          case "price": {
            if (cleaned.value.startsWith("<")) {
              queryOptions.push(
                ` marketplace.price<${DB.connection.escape(
                  cleaned.value.slice(1)
                )}`
              );
            } else if (cleaned.value.startsWith(">")) {
              queryOptions.push(
                ` marketplace.price>${DB.connection.escape(
                  cleaned.value.slice(1)
                )}`
              );
            } else
              queryOptions.push(
                ` marketplace.price=${DB.connection.escape(cleaned.value)}`
              );
            break;
          }
          case "owner": {
            queryOptions.push(
              ` user_card.owner_id=${DB.connection.escape(cleaned.value)}`
            );
            break;
          }
        }
      }
    }
    return queryOptions;
  }
}
