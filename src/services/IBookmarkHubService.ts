import { IBookmark } from "./models/IBookmark";

export interface IBookmarkHubService {
    getAllBookmarks(): Promise<IBookmark[]>;
}