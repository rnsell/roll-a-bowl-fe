/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type CreateRecipeInput = {
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createRecipe: RecipeType;
  deleteRecipe: Scalars['Boolean']['output'];
  updateRecipe: RecipeType;
};


export type MutationCreateRecipeArgs = {
  input: CreateRecipeInput;
};


export type MutationDeleteRecipeArgs = {
  slug: Scalars['String']['input'];
};


export type MutationUpdateRecipeArgs = {
  input: UpdateRecipeInput;
  slug: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<UserProfile>;
  recipe?: Maybe<RecipeType>;
  recipes: Array<RecipeType>;
  user?: Maybe<UserProfile>;
};


export type QueryRecipeArgs = {
  slug: Scalars['String']['input'];
};

export type RecipeType = {
  __typename?: 'RecipeType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  tenantId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['Int']['output'];
};

export type UpdateRecipeInput = {
  instructions?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UserProfile = {
  __typename?: 'UserProfile';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  status: UserStatus;
  tenantId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED';

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', me?: { __typename?: 'UserProfile', id: number, email: string, firstName: string, lastName: string, fullName: string, emailVerified: boolean, status: UserStatus, tenantId: number, createdAt: string, updatedAt: string } | null };

export type GetRecipesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecipesQuery = { __typename?: 'Query', recipes: Array<{ __typename?: 'RecipeType', id: number, name: string, slug: string, instructions?: string | null, createdAt: string, updatedAt: string, tenantId: number, userId: number }> };


export const GetCurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export const GetRecipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRecipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<GetRecipesQuery, GetRecipesQueryVariables>;