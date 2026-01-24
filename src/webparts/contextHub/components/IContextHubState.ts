import FollowedSitesService from '../../../services/FollowedSitesService';

export interface IContextHubState {
  followedSitesService: FollowedSitesService | undefined;
}
