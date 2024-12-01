export interface IFile {
    filename: string;
    mimetype: string;
    encoding: string;
    url?: string;
}

export enum FileType {
    PRODUCT,
    CATEGORY
}
