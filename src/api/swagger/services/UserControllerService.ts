/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * @param id
     * @returns User OK
     * @throws ApiError
     */
    public static getInfoUser(
        id: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user-info/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param fullName
     * @param email
     * @param status
     * @param roleId
     * @param newPassword
     * @returns User OK
     * @throws ApiError
     */
    public static updateUser(
        id: string,
        fullName?: string,
        email?: string,
        status?: string,
        roleId?: string,
        newPassword?: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/user-info/{id}',
            path: {
                'id': id,
            },
            query: {
                'fullName': fullName,
                'email': email,
                'status': status,
                'roleId': roleId,
                'newPassword': newPassword,
            },
        });
    }
}
