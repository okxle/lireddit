import {
  Field,
  InputType
} from "type-graphql";


@InputType() // For arguments
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
