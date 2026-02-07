import { IFollowedSite } from "./models/IFollowedSite";
import { IFlaggedEmail } from "./models/IFlaggedEmail";

export interface IContextHubService {
    getFollowedSites(): Promise<IFollowedSite[]>;
    getFlaggedEmails(): Promise<IFlaggedEmail[]>;
}