import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { appDataSource } from "../appDataSource";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType() // For output
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number, 
    @Arg("value", () => Int) value: number, 
    @Ctx() { req }: MyContext) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    console.log(value, realValue)
    const { userId } = req.session;
    
    await appDataSource.query(`
    start transaction;
    insert into Updoot 
    ("userId", "postId", value)
    values (${userId}, ${postId}, ${realValue});
    update Post
    set points = points + ${realValue}
    where id = ${postId};
    commit;
    `)
    
    // await Updoot.insert({
    //   userId,
    //   postId,
    //   value: realValue
    // });

    // await appDataSource.query(`
    // update Post
    // set points = points + $1
    // where id = $2
    // `, [realValue, postId])
    
    return true;
  }

  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    // @Info() info: any // pass info to build query based on that info
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(limit, 50);
    const realLimitPlusOne = realLimit + 1;
    console.log(cursor)
    const posts = await appDataSource.query(`
    select
      p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) creator 
    from
      "post" as p
    inner join "user" as u
    on
      p."creatorId" = u.id
    ${
      cursor ?
      `
    where 
      p."createdAt" < '${cursor}'
      `: ''
    }
    order by
      p."createdAt" desc
    limit ${realLimitPlusOne}
    `);

    // const queryBuilder = appDataSource
    //   .getRepository(Post)
    //   .createQueryBuilder("p") // alias
    //   .innerJoinAndSelect(
    //     "p.creator",
    //     "u",
    //     `u.id = p."creatorId"`,
    //   )
    //   // .orderBy('p."createdAt"', "DESC")
    //   .take(realLimitPlusOne);
    // console.log("hehehehe")
    // if (cursor) {
    //   queryBuilder.where('p."createdAt" < :cursor', { cursor: new Date(cursor) });
    // }
    // const posts = await queryBuilder.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (typeof title != "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch (error) {
      return false;
    }
    return true;
  }
}
