/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageable } from '../models/Pageable';
import type { PageRole } from '../models/PageRole';
import type { Role } from '../models/Role';
import type { RoleRequest } from '../models/RoleRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleControllerService {
    /**
     * @param id
     * @returns Role OK
     * @throws ApiError
     */
    public static getRoleById(
        id: string,
    ): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/roles/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Role OK
     * @throws ApiError
     */
    public static updateRole(
        id: string,
        requestBody: RoleRequest,
    ): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/roles/{id}',
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
    public static deleteRole(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/roles/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param pageable
     * @returns PageRole OK
     * @throws ApiError
     */
    public static getAllRolesPage(
        pageable: Pageable,
    ): CancelablePromise<PageRole> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/roles',
            query: {
                'pageable': pageable,
            },
        });
    }
    /**
     * @param requestBody
     * @returns Role OK
     * @throws ApiError
     */
    public static createRole(
        requestBody: RoleRequest,
    ): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/roles',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns Role OK
     * @throws ApiError
     */
    public static getAllRoles(): CancelablePromise<Array<Role>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/roles/all',
        });
    }
}
