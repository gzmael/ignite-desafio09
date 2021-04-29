import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a Statement", async () => {
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
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        description: "description",
      });

    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to create a statement with a invalid User", async () => {
    const response = await request(app)
      .post("/api/v1/statements")
      .set("Authorization", `Bearer invalidToken`)
      .send({
        amount: 10,
        description: "description",
      });

    expect(response.status).toEqual(401);
  });
});
