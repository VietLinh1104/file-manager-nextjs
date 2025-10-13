/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Attachments } from '../models/Attachments';
import type { AttachmentsRequest } from '../models/AttachmentsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentsControllerService {
    /**
     * @param requestBody
     * @returns Attachments OK
     * @throws ApiError
     */
    public static createAttachment(
        requestBody: AttachmentsRequest,
    ): CancelablePromise<Attachments> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/attachments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
