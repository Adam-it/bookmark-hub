import { IContextHubService } from "./IContextHubService";
import { IFollowedSite } from "./models/IFollowedSite";
import { IFlaggedEmail } from "./models/IFlaggedEmail";
import { IFollowedFile } from "./models/IFollowedFile";
import { IBookmark, BookmarkType } from "./models/IBookmark";
import { getGraph } from "../webparts/contextHub/pnpjsConfig";

export class ContextHubService implements IContextHubService {
    private async getFollowedSites(): Promise<IFollowedSite[]> {
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

    private async getFlaggedEmails(): Promise<IFlaggedEmail[]> {
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

    private async getFollowedFiles(): Promise<IFollowedFile[]> {
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

    public async getAllBookmarks(): Promise<IBookmark[]> {
        try {
            const [sites, emails, files] = await Promise.all([
                this.getFollowedSites(),
                this.getFlaggedEmails(),
                this.getFollowedFiles()
            ]);

            const bookmarks: IBookmark[] = [
                ...sites.map(site => this._mapSiteToBookmark(site)),
                ...emails.map(email => this._mapEmailToBookmark(email)),
                ...files.map(file => this._mapFileToBookmark(file))
            ];

            return bookmarks.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        } catch (error) {
            console.error('Error getting all bookmarks:', error);
            return [];
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