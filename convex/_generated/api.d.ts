/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as authMutations from "../authMutations.js";
import type * as authQueries from "../authQueries.js";
import type * as categories from "../categories.js";
import type * as deleteAllOrders from "../deleteAllOrders.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as updateLocalImages from "../updateLocalImages.js";
import type * as wishlist from "../wishlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authMutations: typeof authMutations;
  authQueries: typeof authQueries;
  categories: typeof categories;
  deleteAllOrders: typeof deleteAllOrders;
  products: typeof products;
  reviews: typeof reviews;
  seed: typeof seed;
  updateLocalImages: typeof updateLocalImages;
  wishlist: typeof wishlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
