import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get a statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Name",
      email: "email@email.com",
      password: "qwe123",
    });
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "qwe123",
    });
    const { token } = responseToken.body;

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        description: "description",
      });

    const statement = statementResponse.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to get a statement with a invalid User", async () => {
    const response = await request(app)
      .get("/api/v1/statements/non-id")
      .set("Authorization", `Bearer invalidToken`);

    expect(response.status).toEqual(401);
  });

  it("Should not be able to get a invalid statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Name",
      email: "email@email.com",
      password: "qwe123",
    });
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "qwe123",
    });
    const { token } = responseToken.body;
    const response = await request(app)
      .get("/api/v1/statements/fde8ccf5-9209-4791-a956-cd9ed1877683")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(404);
  });
});
