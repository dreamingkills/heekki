import { DB } from "../database";
import { PlayerService } from "../database/service/PlayerService";
import { Card } from "../structures/card/Card";
import * as error from "../structures/Error";

export class SerialGenerator {
  public static queueSerialGen = (() => {
    let pending = Promise.resolve();

    const run = async (
      card: Card,
      force: boolean,
      discordId: string,
      price: number,
      free: boolean
    ): Promise<any> => {
      try {
        await pending;
      } finally {
        const profile = await PlayerService.getProfileByDiscordId(discordId);
        if (profile.coins < price && !free) {
          throw new error.NotEnoughCoinsError();
        } else if (!free) {
          await PlayerService.removeCoinsFromProfile(profile, price);
        }

        const serial = (await DB.query(
          `SELECT * FROM serial_number WHERE id=?;`,
          [card.serialId]
        )) as { id: number; serial_number: number }[];
        if (
          card.serialLimit > 0 &&
          serial[0].serial_number >= card.serialLimit &&
          force === false
        ) {
          throw new error.MaxSerialError();
        }

        await DB.query(`UPDATE serial_number SET serial_number=? WHERE id=?;`, [
          serial[0].serial_number + 1,
          card.serialId,
        ]);

        return serial[0].serial_number + 1;
      }
    };

    return (
      card: Card,
      force: boolean,
      discordId: string,
      price: number,
      free: boolean
    ) => (pending = run(card, force, discordId, price, free));
  })();
}
