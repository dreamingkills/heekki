import { DB } from "../database";
import { Card } from "../structures/card/Card";

export class SerialGenerator {
  public static queueSerialGen = (() => {
    let pending = Promise.resolve();

    const run = async (card: Card): Promise<any> => {
      try {
        await pending;
      } finally {
        const serial = <number>(
          (
            await DB.query(`SELECT * FROM serial_number WHERE id=?;`, [
              card.serialId,
            ])
          )[0][`serial_number`]
        );
        await DB.query(`UPDATE serial_number SET serial_number=? WHERE id=?;`, [
          serial + 1,
          card.serialId,
        ]);

        return serial + 1;
      }
    };

    return (card: Card) => (pending = run(card));
  })();
}
