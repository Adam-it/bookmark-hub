import { IContextHubService } from "./IContextHubService";
import { IFollowedSite } from "./models/IFollowedSite";
import { getGraph } from "../webparts/contextHub/pnpjsConfig";

export class ContextHubService implements IContextHubService {
    public async getFollowedSites(): Promise<IFollowedSite[]> {
        try {
            const graph = getGraph();
            const response = await graph.me.followedSites.select('id', 'webUrl', 'displayName', 'description', 'lastModifiedDateTime')();
            return response as IFollowedSite[];
        } catch (error) {
            console.error('Error getting followed sites:', error);
            return [];
        }
    }
}