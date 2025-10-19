/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageable } from '../models/Pageable';
import type { PagePartners } from '../models/PagePartners';
import type { Partners } from '../models/Partners';
import type { PartnersRequest } from '../models/PartnersRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PartnersControllerService {
    /**
     * @param id
     * @returns Partners OK
     * @throws ApiError
     */
    public static getPartnerById(
        id: string,
    ): CancelablePromise<Partners> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/partners/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Partners OK
     * @throws ApiError
     */
    public static updatePartner(
        id: string,
        requestBody: PartnersRequest,
    ): CancelablePromise<Partners> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/partners/{id}',
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
    public static deletePartner(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/partners/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param pageable
     * @returns PagePartners OK
     * @throws ApiError
     */
    public static getAllPartnersPage(
        pageable: Pageable,
    ): CancelablePromise<PagePartners> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/partners',
            query: {
                'pageable': pageable,
            },
        });
    }
    /**
     * @param requestBody
     * @returns Partners OK
     * @throws ApiError
     */
    public static createPartner(
        requestBody: PartnersRequest,
    ): CancelablePromise<Partners> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/partners',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param type
     * @returns Partners OK
     * @throws ApiError
     */
    public static getPartnersByType(
        type: string,
    ): CancelablePromise<Array<Partners>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/partners/type/{type}',
            path: {
                'type': type,
            },
        });
    }
    /**
     * @returns Partners OK
     * @throws ApiError
     */
    public static getAllPartners(): CancelablePromise<Array<Partners>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/partners/all',
        });
    }
}
