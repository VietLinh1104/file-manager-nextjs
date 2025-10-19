/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { Partners } from './Partners';
import type { SortObject } from './SortObject';
export type PagePartners = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<Partners>;
    number?: number;
    sort?: SortObject;
    pageable?: PageableObject;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean;
};

