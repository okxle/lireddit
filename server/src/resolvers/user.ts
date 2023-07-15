import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  InputType,
  Field,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";

@InputType() // For arguments
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType() // For returns
class FieldError {
  @Field()
  field: String;

  @Field()
  message: String;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => UserResponse, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (req.session.userId) {
      const user = await em.findOne(User, { id: req.session.userId });
      return { user };
    }
    return null;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "user already exist",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username does not exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "password incorrect",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }
}
