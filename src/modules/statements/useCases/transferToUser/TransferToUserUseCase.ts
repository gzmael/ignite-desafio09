import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferToUserError } from "./TransferToUserErros";

interface IRequest {
  amount: number;
  description: string;
  user_to: string;
  user_from: string;
}

@injectable()
class TransferToUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    user_from,
    user_to,
  }: IRequest): Promise<Statement> {
    // busca o usuário que vai enviar
    const userSender = await this.usersRepository.findById(user_from);

    if (!userSender) {
      throw new TransferToUserError.UserNotFound();
    }

    // busca um balanço do usuário
    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: userSender.id,
      with_statement: false,
    });
    const total = balance - amount;
    // verifica se tem dinheiro suficiente
    if (total < 0) {
      throw new TransferToUserError.InsufficientFunds();
    }

    // busca o usuário que vai receber o dinheiro
    const userReceiver = await this.usersRepository.findById(user_to);

    if (!userReceiver) {
      throw new TransferToUserError.UserReceiveNotFound();
    }

    const statement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: userReceiver.id,
      sender_id: userSender.id,
    });

    return statement;
  }
}

export { TransferToUserUseCase };
