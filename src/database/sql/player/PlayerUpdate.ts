import { Eden } from "../../../structures/game/Eden";
import { Profile } from "../../../structures/player/Profile";
import { UserCard } from "../../../structures/player/UserCard";
import { DB, DBClass } from "../../index";
import { PlayerService } from "../../service/PlayerService";

export class PlayerUpdate extends DBClass {
  public static async createEden(profile: Profile): Promise<Eden> {
    await DB.query(`INSERT INTO eden (discord_id) VALUES (?);`, [
      profile.discord_id,
    ]);
    return await PlayerService.getEden(profile);
  }

  /*
      Eden
            */
  public static async addCardToEden(
    card: UserCard,
    member: string,
    profile: Profile
  ): Promise<Eden> {
    await DB.query(`UPDATE eden SET ${member}=? WHERE discord_id=?;`, [
      card.userCardId,
      profile.discord_id,
    ]);
    return await PlayerService.getEden(profile);
  }
  public static async removeCardFromEden(
    member: string,
    profile: Profile
  ): Promise<Eden> {
    await DB.query(`UPDATE eden SET ${member}=NULL WHERE discord_id=?`, [
      profile.discord_id,
    ]);
    return await PlayerService.getEden(profile);
  }

  public static async setHourlyRate(
    profile: Profile,
    rate: number
  ): Promise<Eden> {
    await DB.query(`UPDATE eden SET hourly_rate=? WHERE discord_id=?;`, [
      rate,
      profile.discord_id,
    ]);
    return await PlayerService.getEden(profile);
  }
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

  public static async createNewProfile(discordId: string): Promise<Profile> {
    await DB.query(
      `INSERT INTO user_profile (discord_id, coins) VALUES (?, ${300});`,
      [discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
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
    discordId: string,
    amount: number
  ): Promise<Profile> {
    await DB.query(`UPDATE user_profile SET coins=coins-? WHERE discord_id=?`, [
      amount,
      discordId,
    ]);
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async addHearts(
    discordId: string,
    amount: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts+? WHERE discord_id=?;`,
      [amount, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async removeHearts(
    discordId: string,
    amount: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET hearts=hearts-? WHERE discord_id=?`,
      [amount, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async setHeartSendTimestamp(
    discordId: string,
    time: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET hearts_last=? WHERE discord_id=?;`,
      [time, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async setHeartBoxTimestamp(
    discordId: string,
    time: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET heart_box_last=? WHERE discord_id=?;`,
      [time, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async giveBadge(
    discordId: string,
    badge_id: number
  ): Promise<Profile> {
    await DB.query(
      `INSERT INTO user_badge (discord_id, badge_id) VALUES (?, ?);`,
      [discordId, badge_id]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async removeBadge(
    discordId: string,
    badge_id: number
  ): Promise<Profile> {
    await DB.query(
      `DELETE FROM user_badge WHERE discord_id=? AND badge_id=?;`,
      [discordId, badge_id]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async setOrphanTimestamp(
    discordId: string,
    time: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET last_orphan=? WHERE discord_id=?;`,
      [time, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async setMissionTimestamp(
    discordId: string,
    time: number
  ): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET mission_next=? WHERE discord_id=?;`,
      [time, discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }
  public static async setDailyTimestamp(
    discordId: string,
    time: number
  ): Promise<Profile> {
    await DB.query(`UPDATE user_profile SET daily_last=? WHERE discord_id=?;`, [
      time,
      discordId,
    ]);
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async giveReputation(
    senderId: string,
    receiverId: string
  ): Promise<Profile> {
    await DB.query(
      `INSERT INTO reputation (sender_id, receiver_id) VALUES (?, ?);`,
      [senderId, receiverId]
    );
    return await PlayerService.getProfileByDiscordId(receiverId);
  }

  public static async removeReputation(
    sender_id: string,
    receiverId: string
  ): Promise<Profile> {
    await DB.query(
      `DELETE FROM reputation WHERE sender_id=? AND receiver_id=?;`,
      [sender_id, receiverId]
    );
    return await PlayerService.getProfileByDiscordId(receiverId);
  }

  public static async restrictUser(discordId: string): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET restricted=true WHERE discord_id=?;`,
      [discordId]
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async unrestrictUser(discordId: string): Promise<Profile> {
    await DB.query(
      `UPDATE user_profile SET restricted=false WHERE discord_id=?;`,
      discordId
    );
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async addToWell(
    discordId: string,
    amount: number
  ): Promise<Profile> {
    await DB.query(`UPDATE user_profile SET well=well+? WHERE discord_id=?;`, [
      amount,
      discordId,
    ]);
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async useCard(
    discordId: string,
    cardId: number
  ): Promise<Profile> {
    await DB.query(`UPDATE user_profile SET use_card=? WHERE discord_id=?;`, [
      cardId,
      discordId,
    ]);
    return await PlayerService.getProfileByDiscordId(discordId);
  }

  public static async unsetDefaultCard(discordId: string): Promise<Profile> {
    await DB.query(`UPDATE user_profile SET use_card=0 WHERE discord_id=?;`, [
      discordId,
    ]);
    return await PlayerService.getProfileByDiscordId(discordId);
  }
}
