import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { User } from "../entities/User";
import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = async (
  options: UsernamePasswordInput,
  em: EntityManager<IDatabaseDriver<Connection>>
) => {
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      },
    ];
  }

  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include @",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "length must be greater than 3",
      },
    ];
  }

  const existingUsername = await em.findOne(User, {
    username: options.username,
  });
  if (existingUsername) {
    return [
      {
        field: "username",
        message: "user already exist",
      },
    ];
  }

  const existingEmail = await em.findOne(User, { email: options.email });
  if (existingEmail) {
    return [
      {
        field: "email",
        message: "email already exist",
      },
    ];
  }
  return;
};
