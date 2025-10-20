/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageable } from '../models/Pageable';
import type { PageTransactions } from '../models/PageTransactions';
import type { TransactionRequest } from '../models/TransactionRequest';
import type { TransactionResponse } from '../models/TransactionResponse';
import type { Transactions } from '../models/Transactions';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionControllerService {
    /**
     * @param id
     * @returns TransactionResponse OK
     * @throws ApiError
     */
    public static getTransactionById(
        id: string,
    ): CancelablePromise<TransactionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transactions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Transactions OK
     * @throws ApiError
     */
    public static updateTransaction(
        id: string,
        requestBody: TransactionRequest,
    ): CancelablePromise<Transactions> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/transactions/{id}',
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
    public static deleteTransaction(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/transactions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param pageable
     * @returns PageTransactions OK
     * @throws ApiError
     */
    public static getAllTransactions(
        pageable: Pageable,
    ): CancelablePromise<PageTransactions> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transactions',
            query: {
                'pageable': pageable,
            },
        });
    }
    /**
     * @param requestBody
     * @returns Transactions OK
     * @throws ApiError
     */
    public static createTransaction(
        requestBody: TransactionRequest,
    ): CancelablePromise<Transactions> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/transactions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns Transactions OK
     * @throws ApiError
     */
    public static getAllTransactions1(): CancelablePromise<Array<Transactions>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/transactions/all',
        });
    }
    /**
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static deleteListTransaction(
        requestBody: Array<string>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/transactions/batch-delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
