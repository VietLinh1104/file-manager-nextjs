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
     * @returns TransactionCategory OK
     * @throws ApiError
     */
    public static getAllTransactionCategory(): CancelablePromise<Array<TransactionCategory>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transaction-category',
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
}
