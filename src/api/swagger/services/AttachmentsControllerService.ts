/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Attachments } from '../models/Attachments';
import type { AttachmentsRequest } from '../models/AttachmentsRequest';
import type { Pageable } from '../models/Pageable';
import type { PageAttachmentResponse } from '../models/PageAttachmentResponse';
import type { PageAttachments } from '../models/PageAttachments';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentsControllerService {
    /**
     * @param id
     * @returns Attachments OK
     * @throws ApiError
     */
    public static getAttachmentById(
        id: string,
    ): CancelablePromise<Attachments> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/attachments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Attachments OK
     * @throws ApiError
     */
    public static updateAttachmentById(
        id: string,
        requestBody: AttachmentsRequest,
    ): CancelablePromise<Attachments> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/attachments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteAttachmentById(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/attachments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param pageable
     * @returns PageAttachments OK
     * @throws ApiError
     */
    public static getListAttachmentsPage(
        pageable: Pageable,
    ): CancelablePromise<PageAttachments> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/attachments',
            query: {
                'pageable': pageable,
            },
        });
    }
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
    /**
     * @param requestBody
     * @returns Attachments OK
     * @throws ApiError
     */
    public static createListAttachment(
        requestBody: Array<AttachmentsRequest>,
    ): CancelablePromise<Array<Attachments>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/attachments/list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param pageable
     * @returns PageAttachmentResponse OK
     * @throws ApiError
     */
    public static getAttachmentsWithEntities(
        pageable: Pageable,
    ): CancelablePromise<PageAttachmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/attachments/with-entities',
            query: {
                'pageable': pageable,
            },
        });
    }
    /**
     * @returns Attachments OK
     * @throws ApiError
     */
    public static getListAttachments(): CancelablePromise<Array<Attachments>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/attachments/all',
        });
    }
    /**
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static deleteListAttachment(
        requestBody: Array<string>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/attachments/batch-delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
