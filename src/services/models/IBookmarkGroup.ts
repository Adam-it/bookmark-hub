export interface IBookmarkGroup {
    id: string;
    index: number;
    name: string;
    description?: string;
    archived: boolean;
    collapsed: boolean;
}