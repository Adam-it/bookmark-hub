import { IFollowedSite } from '../../../services/models/IFollowedSite';
import { IFlaggedEmail } from '../../../services/models/IFlaggedEmail';

export interface IContextHubState {
  followedSites: IFollowedSite[];
  flaggedEmails: IFlaggedEmail[];
}
