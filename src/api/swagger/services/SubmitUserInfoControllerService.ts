/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubmitUserInfoControllerService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static continueProcess(
        requestBody: Record<string, any>,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/process/submit-user-info',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
