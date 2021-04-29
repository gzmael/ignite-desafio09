import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate a User", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Name",
      email: "email@email.com",
      password: "qwe123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      name: "Name",
      email: "email@email.com",
      password: "qwe123",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate a invalid User", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      name: "Name",
      email: "invalid@email.com",
      password: "qwe123",
    });

    expect(response.status).toEqual(401);
  });
});
