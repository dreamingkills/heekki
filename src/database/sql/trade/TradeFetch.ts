import { DBClass, DB } from "../..";

export class TradeFetch extends DBClass {
  public static async getTradesByUniqueId(
    unique: string
  ): Promise<
    {
      unique: string;
      sender: string;
      recipient: string;
      senderCard: number;
      recipientCard: number;
    }[]
  > {
    const query = (await DB.query(
      `SELECT * FROM trade_request WHERE unique_id=?;`,
      [unique]
    )) as {
      unique_id: string;
      sender_id: string;
      recipient_id: string;
      sender_card: number;
      recipient_card: number;
    }[];
    const data = query.map((e) => {
      return {
        unique: e.unique_id,
        sender: e.sender_id,
        recipient: e.recipient_id,
        senderCard: e.sender_card,
        recipientCard: e.recipient_card,
      };
    });

    return data;
  }

  public static async getTradesByUserId(
    user_id: string
  ): Promise<
    {
      unique: string;
      sender: string;
      recipient: string;
      senderCard: number;
      recipientCard: number;
    }[]
  > {
    const query = (await DB.query(
      `SELECT * FROM trade_request WHERE sender_id=? OR recipient_id=?;`,
      [user_id, user_id]
    )) as {
      unique_id: string;
      sender_id: string;
      recipient_id: string;
      sender_card: number;
      recipient_card: number;
    }[];
    const data = query.map((e) => {
      return {
        unique: e.unique_id,
        sender: e.sender_id,
        recipient: e.recipient_id,
        senderCard: e.sender_card,
        recipientCard: e.recipient_card,
      };
    });

    return data;
  }
}
