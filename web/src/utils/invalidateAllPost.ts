import { Cache } from "@urql/exchange-graphcache";

export const invalidateAllPost = (cache: Cache) => {
  // console.log(cache.inspectFields("Query"))
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter(
    (info) => info.fieldName === "posts"
  );
  fieldInfos.forEach((fieldInfo) => {
    cache.invalidate("Query", "posts", fieldInfo.arguments || {});
  });
  // console.log(cache.inspectFields("Query"))
};
