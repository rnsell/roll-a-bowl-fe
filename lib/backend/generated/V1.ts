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

import {
  AuthControllerGetEmailVerificationStatusParams,
  EmailVerificationDto,
  EmailVerificationResponseDto,
  EmailVerificationStatusResponseDto,
  ExchangeTokenDto,
  ExchangeTokenResponseDto,
  PasswordResetDto,
  PasswordResetRequestDto,
  PasswordResetRequestResponseDto,
  PasswordResetResponseDto,
  RequestEmailVerificationDto,
  RequestEmailVerificationResponseDto,
  RevokeTokenDto,
  RevokeTokenResponseDto,
  TenantInfoResponseDto,
  UserLoginDto,
  UserLoginResponseDto,
  UserRegisterDto,
  UserRegisterResponseDto,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class V1<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Authenticate a user with email and password. Requires tenant authentication.
   *
   * @tags user-auth
   * @name AuthControllerLogin
   * @summary User login
   * @request POST:/v1/user-auth/login
   * @secure
   */
  authControllerLogin = (data: UserLoginDto, params: RequestParams = {}) =>
    this.request<UserLoginResponseDto, void>({
      path: `/v1/user-auth/login`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Register a new user account. Requires tenant authentication.
   *
   * @tags user-auth
   * @name AuthControllerRegister
   * @summary User registration
   * @request POST:/v1/user-auth/register
   * @secure
   */
  authControllerRegister = (
    data: UserRegisterDto,
    params: RequestParams = {},
  ) =>
    this.request<UserRegisterResponseDto, void>({
      path: `/v1/user-auth/register`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Generate an email verification token for a user. Returns token data for client to send verification email.
   *
   * @tags user-auth
   * @name AuthControllerRequestEmailVerification
   * @summary Request email verification
   * @request POST:/v1/user-auth/request-email-verification
   * @secure
   */
  authControllerRequestEmailVerification = (
    data: RequestEmailVerificationDto,
    params: RequestParams = {},
  ) =>
    this.request<RequestEmailVerificationResponseDto, void>({
      path: `/v1/user-auth/request-email-verification`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Verify a user email address using a verification token.
   *
   * @tags user-auth
   * @name AuthControllerVerifyEmail
   * @summary Verify email
   * @request POST:/v1/user-auth/verify-email
   */
  authControllerVerifyEmail = (
    data: EmailVerificationDto,
    params: RequestParams = {},
  ) =>
    this.request<EmailVerificationResponseDto, void>({
      path: `/v1/user-auth/verify-email`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Generate a password reset token for a user. Returns token data for client to send email.
   *
   * @tags user-auth
   * @name AuthControllerRequestPasswordReset
   * @summary Request password reset
   * @request POST:/v1/user-auth/request-password-reset
   * @secure
   */
  authControllerRequestPasswordReset = (
    data: PasswordResetRequestDto,
    params: RequestParams = {},
  ) =>
    this.request<PasswordResetRequestResponseDto, void>({
      path: `/v1/user-auth/request-password-reset`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Reset user password using a valid reset token.
   *
   * @tags user-auth
   * @name AuthControllerResetPassword
   * @summary Reset password
   * @request POST:/v1/user-auth/reset-password
   */
  authControllerResetPassword = (
    data: PasswordResetDto,
    params: RequestParams = {},
  ) =>
    this.request<PasswordResetResponseDto, void>({
      path: `/v1/user-auth/reset-password`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Check if a user email address has been verified. Requires tenant authentication.
   *
   * @tags user-auth
   * @name AuthControllerGetEmailVerificationStatus
   * @summary Check email verification status
   * @request GET:/v1/user-auth/verify-email-status
   * @secure
   */
  authControllerGetEmailVerificationStatus = (
    query: AuthControllerGetEmailVerificationStatusParams,
    params: RequestParams = {},
  ) =>
    this.request<EmailVerificationStatusResponseDto, void>({
      path: `/v1/user-auth/verify-email-status`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Exchange a tenant API key for a JWT authorization token used to authenticate subsequent requests.
   *
   * @tags tenant-auth
   * @name TenantAuthControllerExchangeToken
   * @summary Exchange API key for JWT token
   * @request POST:/v1/tenant-auth/token
   */
  tenantAuthControllerExchangeToken = (
    data: ExchangeTokenDto,
    params: RequestParams = {},
  ) =>
    this.request<ExchangeTokenResponseDto, void>({
      path: `/v1/tenant-auth/token`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Revoke an active JWT authorization token, preventing further use.
   *
   * @tags tenant-auth
   * @name TenantAuthControllerRevokeToken
   * @summary Revoke JWT token
   * @request POST:/v1/tenant-auth/revoke
   */
  tenantAuthControllerRevokeToken = (
    data: RevokeTokenDto,
    params: RequestParams = {},
  ) =>
    this.request<RevokeTokenResponseDto, void>({
      path: `/v1/tenant-auth/revoke`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve tenant metadata from the Bearer token. Requires valid tenant authentication.
   *
   * @tags info
   * @name InfoControllerGetTenantInfo
   * @summary Get tenant information
   * @request GET:/v1/info/tenant
   * @secure
   */
  infoControllerGetTenantInfo = (params: RequestParams = {}) =>
    this.request<TenantInfoResponseDto, void>({
      path: `/v1/info/tenant`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
