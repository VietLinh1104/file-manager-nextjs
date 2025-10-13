/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StartCreateUserProcessControllerService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static startRegistration(
        requestBody: Record<string, any>,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/process/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
