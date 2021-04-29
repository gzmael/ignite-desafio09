import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}
describe("GetStatementBalance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("Should be able to show Statement balance", async () => {
    const hashPass = await hash("teste", 8);

    const user = await inMemoryUsersRepository.create({
      name: "Name",
      password: hashPass,
      email: "email@email.com",
    });

    if (user.id) {
      const operation = OperationType.DEPOSIT;
      const operation2 = OperationType.WITHDRAW;

      await inMemoryStatementsRepository.create({
        amount: 10,
        description: "Description",
        type: operation,
        user_id: user.id,
      });
      await inMemoryStatementsRepository.create({
        amount: 10,
        description: "Description",
        type: operation,
        user_id: user.id,
      });
      await inMemoryStatementsRepository.create({
        amount: 10,
        description: "Description",
        type: operation2,
        user_id: user.id,
      });

      const balance = await getBalanceUseCase.execute({
        user_id: user.id,
      });

      expect(balance.balance).toEqual(10);
    }
  });

  it("Should not be able to show Statement balance with non-user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "non-user",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
