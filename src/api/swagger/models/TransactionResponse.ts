/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Attachments } from './Attachments';
import type { Partners } from './Partners';
import type { TransactionCategory } from './TransactionCategory';
export type TransactionResponse = {
    transactionId?: string;
    user?: string;
    partner?: Partners;
    transactionCategory?: TransactionCategory;
    amount?: number;
    transactionType?: string;
    status?: string;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
    attachmentsList?: Array<Attachments>;
};

