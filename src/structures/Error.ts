import moment from "moment";

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
  constructor() {
    super(
      "Sorry, but I couldn't find that pack. Make sure you entered it correctly.\n**TIP**: You can use `!packs` to see all available packs."
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
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `The card **${reference.identifier.toUpperCase()}#${
        reference.serial
      }** doesn't exist!`
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
export class NotEnoughHeartsToPrestigeError extends ClientError {
  name = "NotEnoughHeartsToPrestigeError";
  constructor(
    has: number,
    required: number,
    reference: { identifier: string; serial: number }
  ) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** doesn't have enough hearts to prestige.\n**${required}** :heart: are required to prestige, but your card only has **${has}**.`
    );
  }
}
export class MaxPrestigeError extends ClientError {
  name = "MaxPrestigeError";
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** is already at 6 stars!`
    );
  }
}
/*
    Card Manipulation Errors
                              */
export class NotYourCardError extends ClientError {
  name = "NotYourCardError";
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** doesn't belong to you.`
    );
  }
}
export class CardNotOrphanedError extends ClientError {
  name = "CardNotOrphanedError";
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** is not forfeited.`
    );
  }
}
export class CardFavoritedError extends ClientError {
  name = "CardFavoritedError";
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** is favorited!\nUse \`!fav ${reference.identifier.toUpperCase()}#${
        reference.serial
      }\` to unfavorite.`
    );
  }
}
export class CardOnMarketplaceError extends ClientError {
  name = "CardOnMarketplaceError";
  constructor() {
    super(
      `That card is currently on the Marketplace.\nTo unlist it, use \`!unlist <card reference>\`.`
    );
  }
}
export class CardInTradeError extends ClientError {
  name = "CardInTradeError";
  constructor() {
    super(`That card is currently in a trade.`);
  }
}

/*
    Marketplace Errors
                        */

export class CardNotForSaleError extends ClientError {
  name = "CardNotForSaleError";
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** isn't for sale.`
    );
  }
}
export class CardAlreadyForSaleError extends ClientError {
  name = "CardAlreadyForSaleError";
  constructor(reference: { identifier: string; serial: number }) {
    super(
      `**${reference.identifier.toUpperCase()}#${
        reference.serial
      }** is already on the Marketplace.`
    );
  }
}
export class InvalidPriceError extends ClientError {
  name = "InvalidPriceError";
  constructor() {
    super(
      `Please enter a valid price, above 0 Coins and below 2,147,483,647 Coins.`
    );
  }
}

/*
    Trading Errors
                    */
export class InvalidTradeError extends ClientError {
  name = "InvalidTradeError";
  constructor(id: string) {
    super(
      `I couldn't find Trade \`${id}\`.\nIt may have been accepted already.`
    );
  }
}
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
