import * as error from "../structures/Error";
import { PlayerFetchSQL as Fetch } from "./sql/player/Fetch";
import { Profile } from "../structures/player/Profile";
import {
  PlayerModifySQL as Modify,
  PlayerModifySQL,
} from "./sql/player/Modify";
import { UserCard } from "../structures/player/UserCard";
import { FriendFetchSQL as FriendFetch } from "./sql/friend/Fetch";
import { FriendModifySQL as FriendModify } from "./sql/friend/Modify";

export class PlayerService {
  private static cleanMention(m: string): string {
    return m.replace(/[\\<>@#&!]/g, "");
  }

  public static async getProfileFromUser(
    m: string,
    p: boolean
  ): Promise<Profile> {
    let discord_id = this.cleanMention(m);
    let user = await Fetch.getProfileFromDiscordId(discord_id);
    if (!user) {
      if (p) throw new error.NoProfileOtherError();
      throw new error.NoProfileError();
    }

    return user;
  }

  public static async createNewUser(m: string): Promise<Profile> {
    let discord_id = this.cleanMention(m);
    if (await Fetch.checkIfUserExists(discord_id)) {
      throw new error.DuplicateProfileError();
    }

    await Modify.createNewProfile(discord_id);
    let profile = await Fetch.getProfileFromDiscordId(discord_id);
    return profile;
  }

  public static async changeProfileDescription(
    m: string,
    desc: string
  ): Promise<Profile> {
    let discord_id = this.cleanMention(m);
    if (!(await Fetch.checkIfUserExists(m))) {
      throw new error.NoProfileError();
    }

    await Modify.changeDescription(discord_id, desc);
    let profile = await Fetch.getProfileFromDiscordId(discord_id);
    return profile;
  }

  public static async getCardsByUser(
    m: string,
    p: boolean
  ): Promise<UserCard[]> {
    let user = await this.getProfileFromUser(this.cleanMention(m), false);
    let cardList = await Fetch.getUserCardsByDiscordId(user.discord_id);

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
    let friendProfile = await this.getProfileFromUser(friend, false);

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
    let friends = await FriendFetch.getFriendsByDiscordId(user.discord_id);
    friends.forEach(async (f) => {
      await PlayerModifySQL.addHearts(f, 1);
    });
    return friends;
  }
}
