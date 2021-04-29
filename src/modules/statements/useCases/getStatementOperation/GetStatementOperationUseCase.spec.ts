import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("GetStatementOperation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to get Statement", async () => {
    const hashPass = await hash("teste", 8);

    const user = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    if (user.id) {
      const operation = OperationType.DEPOSIT;

      const statement = await inMemoryStatementsRepository.create({
        amount: 10,
        description: "Description",
        type: operation,
        user_id: user.id,
      });

      if (statement.id) {
        const getStatement = await getStatementOperationUseCase.execute({
          statement_id: statement.id,
          user_id: user.id,
        });

        expect(getStatement.id).toEqual(statement.id);
        expect(getStatement.amount).toEqual(statement.amount);
      }
    }
  });

  it("Should not be able to get Statement with a non-user", async () => {
    expect(async () => {
      const operation = OperationType.DEPOSIT;
      const statement = await inMemoryStatementsRepository.create({
        amount: 10,
        description: "Description",
        type: operation,
        user_id: "123456",
      });

      if (statement.id) {
        await getStatementOperationUseCase.execute({
          statement_id: statement.id,
          user_id: "non-user_id",
        });
      }
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get a invalid statement", async () => {
    const hashPass = await hash("teste", 8);

    const user = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    expect(async () => {
      const operation = OperationType.DEPOSIT;
      if (user.id) {
        await inMemoryStatementsRepository.create({
          amount: 10,
          description: "Description",
          type: operation,
          user_id: user.id,
        });

        await getStatementOperationUseCase.execute({
          statement_id: "non-statement.id",
          user_id: user.id,
        });
      }
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
