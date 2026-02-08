import { IBookmark } from "./models/IBookmark";

export interface IContextHubService {
    getAllBookmarks(): Promise<IBookmark[]>;
}