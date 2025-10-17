/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Attachments } from './Attachments';
import type { PageableObject } from './PageableObject';
import type { SortObject } from './SortObject';
export type PageAttachments = {
    totalPages?: number;
    totalElements?: number;
    size?: number;
    content?: Array<Attachments>;
    number?: number;
    sort?: SortObject;
    numberOfElements?: number;
    pageable?: PageableObject;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

