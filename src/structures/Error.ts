export abstract class ClientError extends Error {
  message: string;
  name = "ClientError";
  constructor(msg: string) {
    super(msg);
    this.message = msg;
  }
}
export class NoProfileError extends ClientError {
  name = "NoProfileError";
  constructor() {
    super(
      "You haven't created a profile yet! Use the `!play` command to get started."
    );
  }
}
export class NoProfileOtherError extends ClientError {
  name = "NoProfileOtherError";
  constructor() {
    super("That person hasn't created a profile yet!");
  }
}
export class DuplicateProfileError extends ClientError {
  name = "DuplicateProfileError";
  constructor() {
    super("You've already set up a profile! Use `!profile` to view it.");
  }
}
export class PageOutOfBoundsError extends ClientError {
  name = "PageOutOfBoundsError";
  constructor() {
    super(
      "That isn't a valid page! It must be a number greater than or equal to 1."
    );
  }
}
export class NobodyToHugError extends ClientError {
  name = "NobodyToHugError";
  constructor() {
    super(
      "You can't hug nobody! (*hint: you may have typed an invalid mention*)"
    );
  }
}
export class CantHugYourselfError extends ClientError {
  name = "CantHugYourselfError";
  constructor() {
    super("You can't hug yourself!");
  }
}
export class InvalidPackError extends ClientError {
  name = "InvalidPackError";
  constructor() {
    super("That pack does not exist!");
  }
}
export class ExpiredPackError extends ClientError {
  name = "ExpiredPackError";
  constructor() {
    super("That pack is no longer available for purchase!");
  }
}
export class InvalidShopItemError extends ClientError {
  name = "InvalidShopItemError";
  constructor() {
    super("That pack does not have a collection attached to it!");
  }
}
export class NotEnoughCoinsError extends ClientError {
  name = "NotEnoughCoinsError";
  constructor() {
    super("You don't have enough coins to buy that!");
  }
}
export class EmptyPackError extends ClientError {
  name = " EmptyPackError";
  constructor() {
    super("That pack is empty!");
  }
}
export class NoPackIDError extends ClientError {
  name = "NoPackIDError";
  constructor() {
    super("Please specify a valid Pack ID (shown in the !shop).");
  }
}
export class NotANumberError extends ClientError {
  name = "NotANumberError";
  constructor() {
    super("Please use a valid number!");
  }
}
export class InvalidCardError extends ClientError {
  name = "InvalidCardError";
  constructor() {
    super("Please enter a valid card ID!");
  }
}
export class NotEnoughHeartsError extends ClientError {
  name = "NotEnoughHeartsError";
  constructor() {
    super("You don't have enough hearts to do that!");
  }
}
export class InvalidUserCardError extends ClientError {
  name = "InvalidUserCardError";
  constructor() {
    super("Please enter a valid card reference (e.g. `favOriTe#HJ39`)");
  }
}
