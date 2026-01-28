import { IFollowedSite } from "./models/IFollowedSite";

export interface IContextHubService {
    getFollowedSites(): Promise<IFollowedSite[]>;
}