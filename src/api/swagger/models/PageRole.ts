/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { Role } from './Role';
import type { SortObject } from './SortObject';
export type PageRole = {
    totalPages?: number;
    totalElements?: number;
    size?: number;
    content?: Array<Role>;
    number?: number;
    sort?: SortObject;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    pageable?: PageableObject;
    empty?: boolean;
};

