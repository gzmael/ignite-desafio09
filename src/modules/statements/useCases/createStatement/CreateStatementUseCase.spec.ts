import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}
describe("CreateStatement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a new statement ", async () => {
    const hashPass = await hash("teste", 8);

    const user = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    if (user.id) {
      const operation = OperationType.DEPOSIT;

      const statement = await createStatementUseCase.execute({
        amount: 10,
        description: "Deposit",
        type: operation,
        user_id: user.id,
      });

      expect(statement).toHaveProperty("id");
    }
  });

  it("Should not be able to create a new Statement balance with non-user", async () => {
    expect(async () => {
      const operation = OperationType.DEPOSIT;

      await createStatementUseCase.execute({
        amount: 10,
        description: "Deposit",
        type: operation,
        user_id: "non-user",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a new Statement balance with insufficient funds", async () => {
    const hashPass = await hash("teste", 8);

    const user = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    const operation1 = OperationType.DEPOSIT;
    const operation2 = OperationType.WITHDRAW;

    if (user.id) {
      await createStatementUseCase.execute({
        amount: 10,
        description: "Deposit",
        type: operation1,
        user_id: user.id,
      });
    }

    expect(async () => {
      if (user.id) {
        await createStatementUseCase.execute({
          amount: 15,
          description: "Deposit",
          type: operation2,
          user_id: user.id,
        });
      }
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
