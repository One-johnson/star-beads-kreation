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
import type * as cms from "../cms.js";
import type * as customers from "../customers.js";
import type * as deleteAllOrders from "../deleteAllOrders.js";
import type * as emailActions from "../emailActions.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
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
  cms: typeof cms;
  customers: typeof customers;
  deleteAllOrders: typeof deleteAllOrders;
  emailActions: typeof emailActions;
  notifications: typeof notifications;
  orders: typeof orders;
  products: typeof products;
  reviews: typeof reviews;
  seed: typeof seed;
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
