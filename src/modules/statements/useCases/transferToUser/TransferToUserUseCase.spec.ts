import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { TransferToUserError } from "./TransferToUserErros";
import { TransferToUserUseCase } from "./TransferToUserUseCase";

let transferToUserUseCase: TransferToUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("TransferToUser", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    transferToUserUseCase = new TransferToUserUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a new transfer", async () => {
    const hashPass = await hash("teste", 8);

    const userFrom = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    const userTo = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email2@email2.com",
    });

    if (userFrom && userTo) {
      await inMemoryStatementsRepository.create({
        amount: 50,
        description: "deposit",
        type: OperationType.DEPOSIT,
        user_id: userFrom.id,
      });

      const statement = await transferToUserUseCase.execute({
        amount: 10,
        description: "Deposit",
        user_from: userFrom.id,
        user_to: userTo.id,
      });

      expect(statement).toHaveProperty("id");
    }
  });

  it("Should not be able to transfer with non-user", async () => {
    expect(async () => {
      await transferToUserUseCase.execute({
        amount: 10,
        description: "Deposit",
        user_from: "non-user",
        user_to: "non-user",
      });
    }).rejects.toBeInstanceOf(TransferToUserError.UserNotFound);
  });

  it("Should not be able to transfer with non-receiver-user", async () => {
    const hashPass = await hash("teste", 8);

    const userFrom = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });
    await inMemoryStatementsRepository.create({
      amount: 50,
      description: "deposit",
      type: OperationType.DEPOSIT,
      user_id: userFrom.id,
    });

    expect(async () => {
      await transferToUserUseCase.execute({
        amount: 10,
        description: "Deposit",
        user_from: userFrom.id,
        user_to: "non-user",
      });
    }).rejects.toBeInstanceOf(TransferToUserError.UserReceiveNotFound);
  });

  it("Should not be able to transfer with insufficient funds", async () => {
    const hashPass = await hash("teste", 8);

    const userFrom = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    const userTo = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email2@email2.com",
    });

    if (userFrom.id) {
      await inMemoryStatementsRepository.create({
        amount: 50,
        description: "deposit",
        type: OperationType.DEPOSIT,
        user_id: userFrom.id,
      });
    }

    expect(async () => {
      if (userFrom.id && userTo.id) {
        await transferToUserUseCase.execute({
          amount: 60,
          description: "Deposit",
          user_from: userFrom.id,
          user_to: userTo.id,
        });
      }
    }).rejects.toBeInstanceOf(TransferToUserError.InsufficientFunds);
  });
});
