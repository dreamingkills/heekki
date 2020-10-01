import { PlayerService } from "./PlayerService";
import { FriendFetch } from "../sql/friend/FriendFetch";
import { Profile } from "../../structures/player/Profile";
import { FriendUpdate } from "../sql/friend/FriendUpdate";
import * as error from "../../structures/Error";
import { Friend } from "../../structures/player/Friend";

export class FriendService {
  public static async checkRelationshipExists(
    friendOne: Profile,
    friendTwo: Profile
  ): Promise<"OK" | "ALREADY_FRIENDS" | "REQUESTED" | "ERROR" | "ACCEPTABLE"> {
    return await FriendFetch.checkRelationshipExists(
      friendOne.discord_id,
      friendTwo.discord_id
    );
  }
  public static async getFriendsByProfile(
    profile: Profile,
    page: number = 1
  ): Promise<Friend[]> {
    let friends = await FriendFetch.getFriendsByDiscordId(
      profile.discord_id,
      page
    );
    return friends;
  }

  public static async getNumberOfFriendsByProfile(
    profile: Profile
  ): Promise<number> {
    return await FriendFetch.getNumberOfFriends(profile.discord_id);
  }

  public static async getIncomingFriendRequests(
    profile: Profile
  ): Promise<Friend[]> {
    return await FriendFetch.getIncomingFriendRequests(profile.discord_id);
  }

  public static async addFriend(
    sender: Profile,
    friend: Profile
  ): Promise<void> {
    await FriendUpdate.sendFriendRequest(sender.discord_id, friend.discord_id);
  }

  public static async acceptFriendRequest(
    sender: Profile,
    friend: Profile
  ): Promise<void> {
    await FriendUpdate.acceptFriendRequest(
      sender.discord_id,
      friend.discord_id
    );
  }

  public static async removeFriend(
    sender: Profile,
    friend: Profile
  ): Promise<void> {
    await FriendUpdate.removeFriend(sender.discord_id, friend.discord_id);
  }

  public static async sendHearts(
    sender: Profile,
    friends: string[]
  ): Promise<void> {
    await FriendUpdate.sendHearts(sender.discord_id, friends);
  }

  public static async getTotalHeartsSent(
    sender: Profile,
    friends: string[]
  ): Promise<{ sender_id: string; count: number }[]> {
    return await FriendFetch.getTotalHeartsSent(sender.discord_id, friends);
  }
}
