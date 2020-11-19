import moment from "moment";
import { CardService } from "../database/service/CardService";
import { UserCard } from "./player/UserCard";

export abstract class ClientError extends Error {
  message: string;
  name = "ClientError";
  isClientFacing = "true";
  header = "Error";
  constructor(msg: string) {
    super(msg);
    this.message = msg;
  }
}
export class UnknownError extends Error {
  message: string;
  name = "UnknownError";
  constructor(msg: string) {
    super(msg);
    this.message = msg;
  }
}

/*
    Discord Errors
                    */
export class InvalidMemberError extends ClientError {
  name = "InvalidMemberError";
  constructor() {
    super("Sorry, but I couldn't find that person.");
  }
}
export class MissingPermissionError extends ClientError {
  name = "MissingPermissionError";
  constructor(permission: string) {
    super(`I am missing the following permission: \`${permission}\``);
  }
}
export class NotANumberError extends ClientError {
  name = "NotANumberError";
  constructor() {
    super("Please enter a valid number.");
  }
}

/*
    Eden Errors
                 */
export class DifferentCardInEdenError extends ClientError {
  name = "DifferentCardInEdenError";
  constructor(card: UserCard) {
    super(
      `The **${
        card.member
      }** slot is already taken by **${CardService.cardToReference(card)}**.`
    );
  }
}
export class CardAlreadyInEdenError extends ClientError {
  name = "CardAlreadyInEdenError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** is already in Eden.`);
  }
}
export class NoMemberInEdenError extends ClientError {
  name = "NoMemberInEdenError";
  constructor(member: string) {
    super(`You haven't sent a **${member}** card to Eden yet.`);
  }
}
export class CardNotInEdenError extends ClientError {
  name = "CardNotInEdenError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** is not in Eden.`);
  }
}
export class NoCashInEdenError extends ClientError {
  name = "NoCashInEdenError";
  header = "Eden";
  constructor() {
    super(`Eden has not made any money yet. Check back in an hour.`);
  }
}
export class CardInEdenError extends ClientError {
  name = "CardInEdenError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** is currently in Eden.`);
  }
}
/*
    Profile Errors
                    */
export class NoProfileError extends ClientError {
  name = "NoProfileError";
  constructor() {
    super("That user doesn't have a profile.");
  }
}
export class RestrictedUserError extends ClientError {
  name = "RestrictedUserError";
  constructor() {
    super("You've been restricted from Heekki.");
  }
}
export class NotEnoughCoinsError extends ClientError {
  name = "NotEnoughCoinsError";
  constructor() {
    super("You don't have enough cash to buy that!");
  }
}
export class NotEnoughHeartsError extends ClientError {
  name = "NotEnoughHeartsError";
  constructor() {
    super("You don't have enough hearts to do that!");
  }
}
export class NotEnoughShardsError extends ClientError {
  name = "NotEnoughShardsError";
  constructor() {
    super(`You don't have enough shards for that.`);
  }
}
export class NoMentionedUserError extends ClientError {
  name = "NoMentionedUserError";
  constructor() {
    super(`Please mention someone.`);
  }
}
export class NotAMemberError extends ClientError {
  name = "NotAMemberError";
  constructor() {
    super(`Please select a member of LOONA.`);
  }
}

/*
    Timer Errors
                  */
export class SendHeartsCooldownError extends ClientError {
  name = "SendHeartsCooldownError";
  constructor(until: number, now: number) {
    super(
      `Please wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before sending hearts again.`
    );
  }
}
export class HeartBoxCooldownError extends ClientError {
  name = "HeartBoxCooldownError";
  constructor(until: number, now: number) {
    super(
      `Please wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before opening your heart boxes again.`
    );
  }
}
export class OrphanCooldownError extends ClientError {
  name = "OrphanCooldownError";
  constructor(until: number, now: number) {
    super(
      `Please wait **${moment(until).diff(now, "hours")} hours and ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      } minutes** before claiming another forfeited card.`
    );
  }
}
export class MissionCooldownError extends ClientError {
  name = "MissionCooldownError";
  header = "Mission";
  constructor(until: number, now: number) {
    super(
      `You can do another mission in **${moment(until).diff(now, "minutes")}m ${
        moment(until).diff(now, "seconds") -
        moment(until).diff(now, "minutes") * 60
      }s**.`
    );
  }
}
export class DailyCooldownError extends ClientError {
  name = "DailyCooldownError";
  header = "Daily Reward";
  constructor(until: number, now: number) {
    super(
      `You can claim your daily reward in **${moment(until).diff(
        now,
        "hours"
      )}h ${
        moment(until).diff(now, "minutes") -
        moment(until).diff(now, "hours") * 60
      }m**.`
    );
  }
}

/*
    Pack Errors
                 */
export class InvalidPackError extends ClientError {
  name = "InvalidPackError";
  constructor(prefix: string) {
    super(
      `Sorry, but I couldn't find that pack. Make sure you entered it correctly.\n**TIP**: You can use \`${prefix}packs\` to see all available packs.`
    );
  }
}
export class ExpiredPackError extends ClientError {
  name = "ExpiredPackError";
  constructor() {
    super("That pack is no longer available for purchase!");
  }
}

/*
    Friend Errors
                   */
export class CantAddYourselfError extends ClientError {
  name = "CantAddYourselfError";
  constructor() {
    super("You can't add yourself as a friend. :pensive:");
  }
}
export class AlreadyFriendsError extends ClientError {
  name = "AlreadyFriendsError";
  constructor() {
    super("You're already friends with them.");
  }
}
export class CantUnfriendYourselfError extends ClientError {
  name = "CantUnfriendYourselfError";
  constructor() {
    super("You're your own friend... forever!");
  }
}
export class NotFriendsError extends ClientError {
  name = "NotFriendsError";
  constructor() {
    super("You aren't friends with that user anyway. :person_shrugging:");
  }
}
export class PendingFriendRequestError extends ClientError {
  name = "PendingFriendRequestError";
  constructor() {
    super(`You already have a pending friend request with them.`);
  }
}

/*
    Card Errors
                 */
export class MaximumLevelError extends ClientError {
  name = "MaximumLevelError";
  constructor() {
    super(`Your card is at the maximum level for its rarity.`);
  }
}
export class NoCardsError extends ClientError {
  name = "NoCardsError";
  constructor() {
    super(`You don't have any cards yet.`);
  }
}
export class InvalidCardReferenceError extends ClientError {
  name = "InvalidCardReferenceError";
  constructor() {
    super(`Please enter a valid card reference (e.g. **DLHJ#6**)`);
  }
}
export class InvalidUserCardError extends ClientError {
  name = "InvalidUserCardError";
  constructor(reference?: { identifier: string; serial: number }) {
    super(
      reference
        ? `The card **${`${reference.identifier}#${reference.serial}`}** doesn't exist!`
        : `That card doesn't exist!`
    );
  }
}
export class InvalidImageDataError extends ClientError {
  name = "InvalidImageDataError";
  constructor() {
    super(
      "That card has no image data attached to it. Contact RTFL#8058 to get this fixed!"
    );
  }
}
export class MaxSerialError extends ClientError {
  name = "MaxSerialError";
  constructor() {
    super(`There cannot be any more issues of that card.`);
  }
}
export class MaxPrestigeError extends ClientError {
  name = "MaxPrestigeError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** is already at 6 stars!`);
  }
}
/*
    Card Manipulation Errors
                              */
export class NotYourCardError extends ClientError {
  name = "NotYourCardError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** doesn't belong to you.`);
  }
}
export class CardNotOrphanedError extends ClientError {
  name = "CardNotOrphanedError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** is not forfeited.`);
  }
}
export class CardFavoritedError extends ClientError {
  name = "CardFavoritedError";
  constructor(card: UserCard, prefix: string) {
    super(
      `**${CardService.cardToReference(
        card
      )}** is favorited!\nUse \`${prefix}fav ${CardService.cardToReference(
        card
      )}\` to unfavorite.`
    );
  }
}
export class CardOnMarketplaceError extends ClientError {
  name = "CardOnMarketplaceError";
  constructor(card: UserCard, prefix: string) {
    super(
      `**${CardService.cardToReference(
        card
      )}** is currently on the Marketplace.\nTo unlist it, use \`${prefix}mp unsell <card reference>\`.`
    );
  }
}

/*
    Marketplace Errors
                        */

export class CardNotForSaleError extends ClientError {
  name = "CardNotForSaleError";
  constructor(card: UserCard) {
    super(`**${CardService.cardToReference(card)}** isn't for sale.`);
  }
}
export class CardAlreadyForSaleError extends ClientError {
  name = "CardAlreadyForSaleError";
  constructor(card: UserCard) {
    super(
      `**${CardService.cardToReference(card)}** is already on the Marketplace.`
    );
  }
}
export class InvalidPriceError extends ClientError {
  name = "InvalidPriceError";
  constructor() {
    super(
      `Please enter a valid price, above 0 Cash and below 2,147,483,647 Cash.`
    );
  }
}

/*
    Trading Errors
                    */
export class CannotTradeWithYourselfError extends ClientError {
  name = "CannotTradeWithYourselfError";
  constructor() {
    super(`You can't trade with yourself!`);
  }
}
export class InTradeError extends ClientError {
  name = "InTradeError";
  constructor() {
    super(`You're already trading with someone.`);
  }
}
export class UserInTradeError extends ClientError {
  name = "UserInTradeError";
  constructor() {
    super(`That user is currently trading with someone else.`);
  }
}
/*
    Fishing Errors
                    */
export class InvalidFishError extends ClientError {
  name = "InvalidFishError";
  constructor() {
    super(`That fish does not exist.`);
  }
}

/*
    Auction Errors
                    */
export class InvalidAuctionError extends ClientError {
  name = "InvalidAuctionError";
  constructor() {
    super(`Please enter a valid string to use as an auction name.`);
  }
}
export class NoAuctionError extends ClientError {
  name = "NoAuctionError";
  constructor() {
    super(`There isn't an auction going on.`);
  }
}
export class OutbidError extends ClientError {
  name = "OutbidError";
  constructor(bid: number) {
    super(
      `You have been outbid. The current bid is **${bid.toLocaleString()}**.\nYou must bid at least 100 cash higher than the previous bid.`
    );
  }
}
