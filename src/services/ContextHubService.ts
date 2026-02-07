import { IContextHubService } from "./IContextHubService";
import { IFollowedSite } from "./models/IFollowedSite";
import { IFlaggedEmail } from "./models/IFlaggedEmail";
import { getGraph } from "../webparts/contextHub/pnpjsConfig";

export class ContextHubService implements IContextHubService {
    public async getFollowedSites(): Promise<IFollowedSite[]> {
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

    public async getFlaggedEmails(): Promise<IFlaggedEmail[]> {
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
}