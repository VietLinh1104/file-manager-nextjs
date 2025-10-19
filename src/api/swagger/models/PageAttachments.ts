/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Attachments } from './Attachments';
import type { PageableObject } from './PageableObject';
import type { SortObject } from './SortObject';
export type PageAttachments = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<Attachments>;
    number?: number;
    sort?: SortObject;
    pageable?: PageableObject;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean;
};

