/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PageableObject } from './PageableObject';
import type { Role } from './Role';
import type { SortObject } from './SortObject';
export type PageRole = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<Role>;
    number?: number;
    sort?: SortObject;
    pageable?: PageableObject;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean;
};

