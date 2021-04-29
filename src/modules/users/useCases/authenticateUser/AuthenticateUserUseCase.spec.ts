import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("AuthenticateUser", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to authenticate a User", async () => {
    const hashPass = await hash("teste", 8);

    const user = await inMemoryUsersRepository.create({
      email: "teste@teste.com",
      password: hashPass,
      name: "Teste",
    });

    const response = await authenticateUserUseCase.execute({
      email: "teste@teste.com",
      password: "teste",
    });
    expect(response).toHaveProperty("token");
    expect(response.user.id).toEqual(user.id);
  });

  it("Should not be able to authenticate a non-user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "non@email.com",
        password: "teste",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user with invalid password", async () => {
    const hashPass = await hash("teste", 8);

    await inMemoryUsersRepository.create({
      email: "teste@teste.com",
      password: hashPass,
      name: "Teste",
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "teste@teste.com",
        password: "wrongPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
