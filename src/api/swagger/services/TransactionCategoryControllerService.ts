/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionCategory } from '../models/TransactionCategory';
import type { TransactionCategoryRequest } from '../models/TransactionCategoryRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionCategoryControllerService {
    /**
     * @param id
     * @returns TransactionCategory OK
     * @throws ApiError
     */
    public static getTransactionCategoryById(
        id: string,
    ): CancelablePromise<TransactionCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transaction-category/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns TransactionCategory OK
     * @throws ApiError
     */
    public static updateTransactionCategory(
        id: string,
        requestBody: TransactionCategoryRequest,
    ): CancelablePromise<TransactionCategory> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/transaction-category/{id}',
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
    public static deleteTransactionCategory(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/transaction-category/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns TransactionCategory OK
     * @throws ApiError
     */
    public static createTransactionCategory(
        requestBody: TransactionCategoryRequest,
    ): CancelablePromise<TransactionCategory> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transaction-category',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns TransactionCategory OK
     * @throws ApiError
     */
    public static getAllTransactionCategories(): CancelablePromise<Array<TransactionCategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transaction-category/all',
        });
    }
}
