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
