/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { HttpClient, RequestParams } from "./http-client";

export class Database<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Check database connectivity and health status.
   *
   * @tags database
   * @name DatabaseHealthControllerGetHealth
   * @summary Database health check
   * @request GET:/database/health
   */
  databaseHealthControllerGetHealth = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example "healthy" */
        status?: string;
        /** @example true */
        connected?: boolean;
        /** @example 15 */
        responseTime?: number;
      },
      void
    >({
      path: `/database/health`,
      method: "GET",
      format: "json",
      ...params,
    });
}
