import { AppError } from "../../../../shared/errors/AppError";

export namespace TransferToUserError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }

  export class UserReceiveNotFound extends AppError {
    constructor() {
      super("Invalid receiving user", 404);
    }
  }
}
