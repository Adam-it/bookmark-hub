import { IBookmark } from "./models/IBookmark";

export interface IBookmarkHubService {
    getAllBookmarks(): Promise<IBookmark[]>;
    getBookmarksFromAppRoot(): Promise<IBookmark[]>;
    saveBookmarksToAppRoot(bookmarks: IBookmark[]): Promise<void>;
}