import * as error from "../structures/Error";
import { PlayerFetchSQL as Fetch, PlayerFetchSQL } from "./sql/player/Fetch";
import { Profile } from "../structures/player/Profile";
import {
  PlayerModifySQL as Modify,
  PlayerModifySQL,
} from "./sql/player/Modify";
import { UserCard } from "../structures/player/UserCard";
import { FriendFetchSQL as FriendFetch } from "./sql/friend/Fetch";
import { FriendModifySQL as FriendModify } from "./sql/friend/Modify";
import Chance from "chance";
import { CardFetch as CardFetchSQL } from "./sql/card/CardFetch";
import { CardService } from "./Card";
import { CardModify as CardModifySQL } from "./sql/card/CardModify";

export class PlayerService {
  // Remove special characters from mention text (<@2395484958349234>)
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  // New user profile setup
  public static async createNewUser(m: string): Promise<Profile> {
    let discord_id = this.cleanMention(m);
    if (await Fetch.checkIfUserExists(discord_id)) {
      throw new error.DuplicateProfileError();
    }

    await Modify.createNewProfile(discord_id);
    let profile = await Fetch.getProfileFromDiscordId(discord_id, false);
    return profile;
  }

  // Fetch profile object from database by user ID
  public static async getProfileFromUser(
    m: string,
    p: boolean
  ): Promise<Profile> {
    let user: Profile;
    let discord_id = this.cleanMention(m);
    user = await Fetch.getProfileFromDiscordId(discord_id, false);

    if (!user) {
      if (p) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }

    return user;
  }

  // Change the blurb of a user's profile
  public static async changeProfileDescription(
    m: string,
    desc: string
  ): Promise<Profile> {
    let discord_id = this.cleanMention(m);
    if (!(await Fetch.checkIfUserExists(discord_id))) {
      throw new error.NoProfileError();
    }

    await Modify.changeDescription(discord_id, desc);
    let profile = await Fetch.getProfileFromDiscordId(discord_id, false);
    return profile;
  }

  // Get all of a user's cards by user ID
  public static async getCardsByUser(m: string): Promise<UserCard[]> {
    let user = await this.getProfileFromUser(m, false);
    let cardList = await Fetch.getUserCardsByDiscordId(user.discord_id);

    return cardList;
  }

  //Get all unclaimed cards
  public static async getOrphanedCards(): Promise<UserCard[]> {
    let cardList = await Fetch.getUserCardsByDiscordId("0");
    return cardList;
  }

  public static async getFriendsList(discord_id: string) {
    let user = await this.getProfileFromUser(discord_id, false);
    let friends = await FriendFetch.getFriendsByDiscordId(user.discord_id);
    return friends;
  }

  public static async addFriend(
    discord_id: string,
    friend: string
  ): Promise<Profile> {
    let user = await this.getProfileFromUser(discord_id, false);
    let friendProfile = await this.getProfileFromUser(friend, true);

    if (user.discord_id == friendProfile.discord_id)
      throw new error.CannotAddYourselfError();
    let relationshipStatus = await FriendFetch.checkRelationshipExists(
      user.discord_id,
      friendProfile.discord_id
    );
    if (relationshipStatus) throw new error.DuplicateRelationshipError();
    await FriendModify.addFriendByDiscordId(
      user.discord_id,
      friendProfile.discord_id
    );
    return friendProfile;
  }

  public static async removeFriend(
    discord_id: string,
    friend: string
  ): Promise<Profile> {
    let user = await this.getProfileFromUser(discord_id, false);
    let friendProfile = await this.getProfileFromUser(friend, true);

    if (user.discord_id == friendProfile.discord_id)
      throw new error.CannotRemoveYourselfError();
    let relationshipStatus = await FriendFetch.checkRelationshipExists(
      user.discord_id,
      friendProfile.discord_id
    );
    if (!relationshipStatus) throw new error.NonexistentRelationshipError();

    await FriendModify.removeFriendByDiscordId(
      user.discord_id,
      friendProfile.discord_id
    );
    return friendProfile;
  }
  public static async sendHeartsToFriends(
    discord_id: string
  ): Promise<number[]> {
    let user = await this.getProfileFromUser(discord_id, false);

    let last = await PlayerFetchSQL.getLastHeartSendByDiscordId(
      user.discord_id
    );
    let now = Date.now();
    if (now < last + 10800000)
      throw new error.SendHeartsCooldownError(last + 10800000, now);
    let friends = await FriendFetch.getFriendsByDiscordId(user.discord_id);
    friends.forEach(async (f) => {
      await PlayerModifySQL.addHearts(f.toString(), 1);
    });
    await PlayerModifySQL.setHeartSendTimestamp(user.discord_id);
    return friends;
  }
  public static async openHeartBoxes(
    discord_id: string
  ): Promise<{ added: number; total: number; individual: number[] }> {
    let user = await this.getProfileFromUser(discord_id, false);

    let last = await PlayerFetchSQL.getLastHeartBoxByDiscordId(user.discord_id);
    let now = Date.now();
    if (now < last + 14400000)
      throw new error.HeartBoxCooldownError(last + 14400000, now);

    let chance = new Chance();
    let generated: number[] = [];
    for (let i = 0; i < 7; i++) {
      generated.push(chance.weighted([7, 20, 100, 1000], [100, 25, 5, 0.1]));
    }
    let total = generated.reduce((a, b) => {
      return a + b;
    });
    await PlayerModifySQL.addHearts(user.discord_id, total);
    await PlayerModifySQL.setHeartBoxTimestamp(user.discord_id);
    return { added: total, total: user.hearts + total, individual: generated };
  }

  public static async giftCard(
    user: string,
    recipient: string,
    reference: string
  ): Promise<UserCard> {
    let gifter = await this.getProfileFromUser(user, false);
    let receiver = await this.getProfileFromUser(recipient, true);

    let card = await CardFetchSQL.getFullCardDataFromReference(
      reference.split("#")[0],
      parseInt(reference.split("#")[1])
    );
    if (user != card.card.ownerId) throw new error.NotYourCardError();

    let transfer = await PlayerModifySQL.transferCard(
      receiver.discord_id,
      card.card.userCardId
    );
    return transfer;
  }

  public static async forfeitCard(
    user: string,
    reference: string
  ): Promise<UserCard> {
    let owner = await this.getProfileFromUser(user, false);
    let card = await CardFetchSQL.getFullCardDataFromReference(
      reference.split("#")[0],
      parseInt(reference.split("#")[1])
    );

    if (owner.discord_id != card.card.ownerId)
      throw new error.NotYourCardError();

    let forfeit = await CardModifySQL.forfeitCard(card.card);
    return card.card;
  }

  public static async forfeitBulkUnderStars(
    user: string,
    stars: number
  ): Promise<number> {
    let owner = await this.getProfileFromUser(user, false);
    let cardsToForfeit = await PlayerFetchSQL.getUserCardsByDiscordId(
      owner.discord_id,
      stars
    );
    let numberForfeited = 0;
    for (let card of cardsToForfeit) {
      await CardModifySQL.forfeitCard(card);
      numberForfeited++;
    }
    return numberForfeited;
  }

  public static async claimOrphanedCard(
    user: string,
    reference: string
  ): Promise<UserCard> {
    let claimant = await this.getProfileFromUser(user, false);
    let last = await PlayerFetchSQL.getLastOrphanClaimByDiscordId(
      claimant.discord_id
    );

    let now = Date.now();
    if (now < last + 10800000)
      throw new error.OrphanCooldownError(last + 10800000, now);
    let card = await CardService.parseCardDetails(reference);

    if (card.card.ownerId != "0") throw new error.CardNotOrphanedError();
    await PlayerModifySQL.transferCard(
      claimant.discord_id,
      card.card.userCardId
    );
    await PlayerModifySQL.setOrphanTimestamp(claimant.discord_id);
    return card.card;
  }
}
