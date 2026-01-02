/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetRecipeBySlug($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n": typeof types.GetRecipeBySlugDocument,
    "\n  mutation CreateRecipe($input: CreateRecipeInput!) {\n    createRecipe(input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateRecipeDocument,
    "\n  query GetRecipeForEdit($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetRecipeForEditDocument,
    "\n  mutation UpdateRecipe($slug: String!, $input: UpdateRecipeInput!) {\n    updateRecipe(slug: $slug, input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateRecipeDocument,
    "\n  query GetRecipes {\n    recipes {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n": typeof types.GetRecipesDocument,
    "\n  query GetCurrentUser {\n    me {\n      id\n      email\n      firstName\n      lastName\n      fullName\n      emailVerified\n      status\n      tenantId\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetCurrentUserDocument,
};
const documents: Documents = {
    "\n  query GetRecipeBySlug($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n": types.GetRecipeBySlugDocument,
    "\n  mutation CreateRecipe($input: CreateRecipeInput!) {\n    createRecipe(input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateRecipeDocument,
    "\n  query GetRecipeForEdit($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetRecipeForEditDocument,
    "\n  mutation UpdateRecipe($slug: String!, $input: UpdateRecipeInput!) {\n    updateRecipe(slug: $slug, input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateRecipeDocument,
    "\n  query GetRecipes {\n    recipes {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n": types.GetRecipesDocument,
    "\n  query GetCurrentUser {\n    me {\n      id\n      email\n      firstName\n      lastName\n      fullName\n      emailVerified\n      status\n      tenantId\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetCurrentUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRecipeBySlug($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n"): (typeof documents)["\n  query GetRecipeBySlug($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateRecipe($input: CreateRecipeInput!) {\n    createRecipe(input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateRecipe($input: CreateRecipeInput!) {\n    createRecipe(input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRecipeForEdit($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetRecipeForEdit($slug: String!) {\n    recipe(slug: $slug) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateRecipe($slug: String!, $input: UpdateRecipeInput!) {\n    updateRecipe(slug: $slug, input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateRecipe($slug: String!, $input: UpdateRecipeInput!) {\n    updateRecipe(slug: $slug, input: $input) {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRecipes {\n    recipes {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n"): (typeof documents)["\n  query GetRecipes {\n    recipes {\n      id\n      name\n      slug\n      instructions\n      createdAt\n      updatedAt\n      tenantId\n      userId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCurrentUser {\n    me {\n      id\n      email\n      firstName\n      lastName\n      fullName\n      emailVerified\n      status\n      tenantId\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetCurrentUser {\n    me {\n      id\n      email\n      firstName\n      lastName\n      fullName\n      emailVerified\n      status\n      tenantId\n      createdAt\n      updatedAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;