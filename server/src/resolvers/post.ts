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
import { Updoot } from "../entities/Updoot";

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
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const upDoot = await Updoot.findOneBy({ postId, userId });
    if (upDoot && upDoot.value !== realValue) {
      appDataSource.transaction(async (tm) => {
        await tm.query(
          `
        update Updoot
        set value = $1
        where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
        update Post
        set points = points + $1
        where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!upDoot) {
      // another way to write transaction
      appDataSource.transaction(async (tm) => {
        await tm.query(
          `
        insert into Updoot 
        ("userId", "postId", value)
        values ($1, $2, $3)
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
        update Post
        set points = points + $1
        where id = $2
        `,
          [realValue, postId]
        );
      });
    }

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
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(limit, 50);
    const realLimitPlusOne = realLimit + 1;
    const posts = await appDataSource.query(`
    select
      p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) creator,
    ${
      req.session.userId
        ? `(
          select 
          value 
          from updoot 
          where "userId" = ${req.session.userId} 
          and "postId" = p.id
        ) "voteStatus"`
        : 'null as "voteStatus"'
    }
    from
      "post" as p
    inner join "user" as u
    on
      p."creatorId" = u.id
    ${
      cursor
        ? `
    where 
      p."createdAt" < '${cursor}'
      `
        : ""
    }
    order by
      p."createdAt" desc
    limit ${realLimitPlusOne}
    `);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id }, relations: ["creator"]});
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
