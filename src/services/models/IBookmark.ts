export enum BookmarkType {
    Site = 'site',
    Email = 'email',
    File = 'file'
}

export interface IBookmark {
    id: string;
    title: string;
    description?: string;
    url: string;
    date: string;
    type: BookmarkType;
    metadata?: {
        from?: string;
        author?: string;
    };
}
