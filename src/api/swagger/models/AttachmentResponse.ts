/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EntityAttachmentInfo } from './EntityAttachmentInfo';
export type AttachmentResponse = {
    attachmentId?: string;
    fileName?: string;
    fileType?: string;
    filePath?: string;
    key?: string;
    uploadedAt?: string;
    fileSize?: number;
    attachedEntities?: Array<EntityAttachmentInfo>;
    attached?: boolean;
};

