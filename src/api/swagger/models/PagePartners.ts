/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { Partners } from './Partners';
import type { SortObject } from './SortObject';
export type PagePartners = {
    totalPages?: number;
    totalElements?: number;
    size?: number;
    content?: Array<Partners>;
    number?: number;
    sort?: SortObject;
    numberOfElements?: number;
    pageable?: PageableObject;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

