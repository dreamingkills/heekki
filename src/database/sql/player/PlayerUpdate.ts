import { Profile } from "../../../structures/player/Profile";
import { DB, DBClass } from "../../index";
import { PlayerService } from "../../service/PlayerService";

export class PlayerUpdate extends DBClass {
  /*
      Currency
                */
  public static async addShards(
    profile: Profile,
    amount: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET shards=shards+? WHERE discord_id=?;`,
      [amount, profile.discord_id]
    );
    return await PlayerService.getProfileByDiscordId(profile.discord_id);
  }
  public static async removeShards(
    profile: Profile,
    amount: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET shards=shards-? WHERE discord_id=?;`,
      [amount, profile.discord_id]
    );
    return await PlayerService.getProfileByDiscordId(profile.discord_id);
  }

  /*
      Time-Based Rewards
                          */
  public static async incrementDailyStreak(profile: Profile): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET daily_streak=daily_streak+1 WHERE discord_id=?;`,
      [profile.discord_id]
    );
    return await PlayerService.getProfileByDiscordId(profile.discord_id);
  }
  public static async resetDailyStreak(profile: Profile): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET daily_streak=0 WHERE discord_id=?;`,
      [profile.discord_id]
    );
    return await PlayerService.getProfileByDiscordId(profile.discord_id);
  }

  public static async createNewProfile(discord_id: string): Promise<void> {
    await DB.query(
      `INSERT INTO user_profile (discord_id, coins) VALUES (?, ${300});`,
      [discord_id]
    );
    return;
  }
  public static async changeDescription(
    discord_id: string,
    description: string
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET blurb=? WHERE discord_id=?;`, [
      description,
      discord_id,
    ]);
    return;
  }
  public static async addCoins(
    discordId: string,
    amount: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET coins=coins+? WHERE discord_id=?;`,
      [amount, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async removeCoins(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET coins=coins-? WHERE discord_id=?`, [
      amount,
      discord_id,
    ]);
    return;
  }
  public static async addHearts(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts+? WHERE discord_id=?;`,
      [amount, discord_id]
    );
    return;
  }
  public static async removeHearts(
    discord_id: string,
    amount: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts-? WHERE discord_id=?`,
      [amount, discord_id]
    );
    return;
  }
  public static async setHeartSendTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET hearts_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
    return;
  }
  public static async setHeartBoxTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET heart_box_last=? WHERE discord_id=?;`,
      [time, discord_id]
    );
    return;
  }
  public static async giveBadge(
    discord_id: string,
    badge_id: number
  ): Promise<void> {
    await DB.query(
      `INSERT INTO user_badge (discord_id, badge_id) VALUES (?, ?);`,
      [discord_id, badge_id]
    );
    return;
  }

  public static async removeBadge(
    discord_id: string,
    badge_id: number
  ): Promise<void> {
    await DB.query(
      `DELETE FROM user_badge WHERE discord_id=? AND badge_id=?;`,
      [discord_id, badge_id]
    );
    return;
  }

  public static async setOrphanTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET last_orphan=? WHERE discord_id=?;`,
      [time, discord_id]
    );
    return;
  }
  public static async setMissionTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET mission_next=? WHERE discord_id=?;`,
      [time, discord_id]
    );
    return;
  }
  public static async setDailyTimestamp(
    discord_id: string,
    time: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET daily_last=? WHERE discord_id=?;`, [
      time,
      discord_id,
    ]);
    return;
  }

  public static async createFish(
    discord_id: string,
    fish: number,
    weight: number,
    weightModId: number,
    identifier: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO fish (owner_id, fish_id, fish_weight, weight_mod, identifier) VALUES (?, ?, ?, ?, ?);`,
      [discord_id, fish, weight, weightModId, identifier]
    );
    return;
  }

  public static async giveReputation(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    await DB.query(
      `INSERT INTO reputation (sender_id, receiver_id) VALUES (?, ?);`,
      [sender_id, receiver_id]
    );
    return;
  }

  public static async removeReputation(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    await DB.query(
      `DELETE FROM reputation WHERE sender_id=? AND receiver_id=?;`,
      [sender_id, receiver_id]
    );
    return;
  }

  public static async addXp(discord_id: string, amount: number): Promise<void> {
    await DB.query(`UPDATE user_profile SET xp=xp+? WHERE discord_id=?;`, [
      amount,
      discord_id,
    ]);
    return;
  }

  public static async makeFishTrophy(id: string): Promise<void> {
    await DB.query(`UPDATE fish SET trophy_fish=true WHERE identifier=?;`, [
      id,
    ]);
    return;
  }

  public static async clearFish(ownerId: string): Promise<void> {
    await DB.query(`DELETE FROM fish WHERE owner_id=? AND trophy_fish=false;`, [
      ownerId,
    ]);
    return;
  }

  public static async restrictUser(discordId: string): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET restricted=true WHERE discord_id=?;`,
      [discordId]
    );
    return;
  }

  public static async unrestrictUser(discordId: string): Promise<void> {
    await DB.query(
      `UPDATE user_profile SET restricted=false WHERE discord_id=?;`,
      discordId
    );
    return;
  }

  public static async addToWell(
    discordId: string,
    amount: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET well=well+? WHERE discord_id=?;`, [
      amount,
      discordId,
    ]);
    return;
  }

  public static async useCard(
    discordId: string,
    cardId: number
  ): Promise<void> {
    await DB.query(`UPDATE user_profile SET use_card=? WHERE discord_id=?;`, [
      cardId,
      discordId,
    ]);
    return;
  }

  public static async unsetDefaultCard(discordId: string): Promise<void> {
    await DB.query(`UPDATE user_profile SET use_card=0 WHERE discord_id=?;`, [
      discordId,
    ]);
    return;
  }
}
