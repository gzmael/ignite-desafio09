import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("ShowUserProfile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to show a user profile", async () => {
    const hashPass = await hash("teste", 8);
    const user = await inMemoryUsersRepository.create({
      name: "Name",
      email: "teste@teste.com",
      password: hashPass,
    });

    if (user.id) {
      const profile = await showUserProfileUseCase.execute(user.id);

      expect(profile.id).toEqual(user.id);
    }
  });

  it("Should not be able to show a non-user profile", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non-user.id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
