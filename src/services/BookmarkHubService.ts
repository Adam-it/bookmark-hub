import { IFollowedSite } from "./models/IFollowedSite";
import { IFlaggedEmail } from "./models/IFlaggedEmail";
import { IFollowedFile } from "./models/IFollowedFile";
import { IBookmark, BookmarkType } from "./models/IBookmark";
import { getGraph } from "../webparts/bookmarkHub/pnpjsConfig";
import { IBookmarkHubService } from "./IBookmarkHubService";
import { SpecialFolder } from "@pnp/graph/files";
import { IAppData } from "./models/IAppData";

export class BookmarkHubService implements IBookmarkHubService {
    private static _appDataFolderName: string = 'BookmarkHub';
    private static _appDataFileName: string = 'bookmarks.json';
    private static _cacheTTL: number = 5 * 60 * 1000;

    private _bookmarksCache: { data: IBookmark[], timestamp: number } | null = null;

    public async getAllBookmarks(): Promise<IBookmark[]> {
        if (this._isCacheValid()) {
            return this._bookmarksCache!.data;
        }

        try {
            const [sites, emails, files] = await Promise.all([
                this._getFollowedSites(),
                this._getFlaggedEmails(),
                this._getFollowedFiles()
            ]);

            const bookmarks: IBookmark[] = [
                ...sites.map(site => this._mapSiteToBookmark(site)),
                ...emails.map(email => this._mapEmailToBookmark(email)),
                ...files.map(file => this._mapFileToBookmark(file))
            ];

            const sortedBookmarks = bookmarks.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            this._bookmarksCache = {
                data: sortedBookmarks,
                timestamp: Date.now()
            };

            return sortedBookmarks;
        } catch (error) {
            console.error('Error getting bookmarks:', error);
            return [];
        }
    }

    public clearBookmarksCache(): void {
        this._bookmarksCache = null;
    }

    private _isCacheValid(): boolean {
        return this._bookmarksCache !== null &&
               (Date.now() - this._bookmarksCache.timestamp) < BookmarkHubService._cacheTTL;
    }

    public async getAppData(): Promise<IAppData> {
        try {
            const folderId = await this._ensureAppDataFolder();
            const graph = getGraph();
            const children = await graph.me.drive.getItemById(folderId).children
                .filter(`name eq '${BookmarkHubService._appDataFileName}'`)();

            if (children.length === 0 || !children[0].id) {
                return { bookmarks: [], groups: [], labels: [] }; 
            }

            const fileContent = await graph.me.drive.getItemById(children[0].id).getContent();
            const text = await fileContent.text();
            const parsed = JSON.parse(text);
            return parsed as IAppData;
        } catch (error) {
            console.error('Error getting app data from app root:', error);
            throw error;
        }
    }

    public async saveAppData(appData: IAppData): Promise<void> {
        try {
            const folderId = await this._ensureAppDataFolder();
            const graph = getGraph();
            const content = JSON.stringify(appData, null, 2);

            await graph.me.drive.getItemById(folderId).upload({
                content: content,
                filePathName: BookmarkHubService._appDataFileName,
                contentType: 'application/json'
            });
        } catch (error) {
            console.error('Error saving app data to app root:', error);
            throw error;
        }
    }

    private async _getFollowedSites(): Promise<IFollowedSite[]> {
        try {
            const graph = getGraph();
            const response = await graph.me.followedSites
                .select('id', 'webUrl', 'displayName', 'description', 'lastModifiedDateTime')();
            return response as IFollowedSite[];
        } catch (error) {
            console.error('Error getting followed sites:', error);
            return [];
        }
    }

    private async _getFlaggedEmails(): Promise<IFlaggedEmail[]> {
        try {
            const graph = getGraph();
            const messages = await graph.me.messages
                .filter("flag/flagStatus eq 'flagged'")
                .select('id', 'subject', 'bodyPreview', 'from', 'receivedDateTime', 'webLink')();
            return messages as IFlaggedEmail[];
        } catch (error) {
            console.error('Error getting flagged emails:', error);
            return [];
        }
    }

    private async _getFollowedFiles(): Promise<IFollowedFile[]> {
        try {
            const graph = getGraph();
            const items = await graph.me.drive.following
                .select('id', 'name', 'webUrl', 'lastModifiedDateTime')();
            return items as IFollowedFile[];
        } catch (error) {
            console.error('Error getting followed files:', error);
            return [];
        }
    }

    private async _ensureAppDataFolder(): Promise<string> {
        try {
            const graph = getGraph();
            const appRoot = await graph.me.drive.special(SpecialFolder.AppRoot)();

            if (!appRoot.id) {
                throw new Error('App root folder ID is undefined');
            }

            const children = await graph.me.drive.getItemById(appRoot.id).children
                .filter(`name eq '${BookmarkHubService._appDataFolderName}'`)();

            if (children.length > 0 && children[0].id) {
                return children[0].id;
            }

            const newFolder = await graph.me.drive.getItemById(appRoot.id).children.addFolder(
                { name: BookmarkHubService._appDataFolderName }
            );
            
            if (!newFolder || !newFolder.id) {
                throw new Error('Newly created app data folder ID is undefined');
            }
            return newFolder.id;
        } catch (error) {
            console.error('Error ensuring app data folder:', error);
            throw error;
        }
    }

    private _mapSiteToBookmark(site: IFollowedSite): IBookmark {
        return {
            id: site.id,
            title: site.displayName,
            description: site.description,
            url: site.webUrl,
            date: site.lastModifiedDateTime || new Date().toISOString(),
            type: BookmarkType.Site
        };
    }

    private _mapEmailToBookmark(email: IFlaggedEmail): IBookmark {
        return {
            id: email.id,
            title: email.subject,
            description: email.bodyPreview,
            url: email.webLink,
            date: email.receivedDateTime,
            type: BookmarkType.Email,
            metadata: {
                from: email.from.emailAddress.name
            }
        };
    }

    private _mapFileToBookmark(file: IFollowedFile): IBookmark {
        return {
            id: file.id,
            title: file.name,
            url: file.webUrl,
            date: file.lastModifiedDateTime,
            type: BookmarkType.File
        };
    }
}