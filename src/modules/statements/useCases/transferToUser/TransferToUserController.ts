import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferToUserUseCase } from "./TransferToUserUseCase";

class TransferToUserController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: user_from } = request.user;
    const { id: user_to } = request.params;
    const { amount, description } = request.body;

    const transferToUserUseCase = container.resolve(TransferToUserUseCase);

    const statement = await transferToUserUseCase.execute({
      amount,
      description,
      user_from,
      user_to,
    });

    return response.json(statement);
  }
}

export { TransferToUserController };
