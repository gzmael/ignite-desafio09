import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("CreateUser", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new User", async () => {
    const user = await createUserUseCase.execute({
      email: "email@email.com",
      name: "Name",
      password: "senha",
    });

    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a new User when already exists", async () => {
    await createUserUseCase.execute({
      email: "email@email.com",
      name: "Name",
      password: "senha",
    });

    expect(async () => {
      await createUserUseCase.execute({
        email: "email@email.com",
        name: "Name",
        password: "senha",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
