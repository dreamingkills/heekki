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

        if (
          card.serialLimit > 0 &&
          card.serialTotal >= card.serialLimit &&
          force === false
        ) {
          throw new error.MaxSerialError();
        }

        await DB.query(`UPDATE card SET serial_total=? WHERE id=?;`, [
          card.serialTotal + 1,
          card.cardId,
        ]);

        return card.serialTotal + 1;
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
