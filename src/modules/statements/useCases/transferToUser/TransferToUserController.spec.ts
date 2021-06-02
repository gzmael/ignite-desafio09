import request from "supertest";
import { Connection } from "typeorm";
import { v4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Transfer To User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to transfer to user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Sender",
      email: "sender@email.com",
      password: "qwe123",
    });

    await request(app).post("/api/v1/users").send({
      name: "Receiver",
      email: "receiver@email.com",
      password: "qwe123",
    });

    const responseTokenSender = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "qwe123",
      });

    const responseTokenReceiver = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receiver@email.com",
        password: "qwe123",
      });
    const { token } = responseTokenSender.body;
    const { user } = responseTokenReceiver.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        description: "description",
      });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        description: "description",
      });

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 15,
        description: "description",
      });

    expect(response.body).toHaveProperty("type");
  });

  it("Should not be able to get the balance with a invalid Token", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Receiver",
      email: "receiver@email.com",
      password: "qwe123",
    });

    const responseTokenReceiver = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receiver@email.com",
        password: "qwe123",
      });
    const { user } = responseTokenReceiver.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .set("Authorization", `Bearer invalid-bearer`)
      .send({
        amount: 15,
        description: "description",
      });

    expect(response.status).toEqual(401);
  });

  it("Should not be able to get the balance with a invalid Receiver User", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Sender",
      email: "sender@email.com",
      password: "qwe123",
    });

    const responseTokenSender = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "qwe123",
      });

    const { token } = responseTokenSender.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        description: "description",
      });

    await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 10,
        description: "description",
      });
    const uuid = v4();

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${uuid}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 15,
        description: "description",
      });

    expect(response.status).toEqual(404);
  });

  it("Should not be able to transfer to user with insuffient founds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Sender",
      email: "sender@email.com",
      password: "qwe123",
    });

    await request(app).post("/api/v1/users").send({
      name: "Receiver",
      email: "receiver@email.com",
      password: "qwe123",
    });

    const responseTokenSender = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender@email.com",
        password: "qwe123",
      });

    const responseTokenReceiver = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "receiver@email.com",
        password: "qwe123",
      });
    const { token } = responseTokenSender.body;
    const { user } = responseTokenReceiver.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfer/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 50,
        description: "description",
      });

    expect(response.status).toEqual(400);
  });
});
