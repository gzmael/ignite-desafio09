import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show a User profile", async () => {
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
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to show a invalid User profile", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer invalidToken`);

    expect(response.status).toEqual(401);
  });
});
