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

export class Health<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Check if the API is running and responsive. No authentication required.
   *
   * @tags health
   * @name HealthControllerGetHealth
   * @summary Health check
   * @request GET:/health
   */
  healthControllerGetHealth = (params: RequestParams = {}) =>
    this.request<
      {
        /** @example "ok" */
        status?: string;
        /** @example "2025-12-20T12:00:00.000Z" */
        timestamp?: string;
      },
      any
    >({
      path: `/health`,
      method: "GET",
      format: "json",
      ...params,
    });
}
