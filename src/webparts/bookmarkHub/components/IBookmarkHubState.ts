import { IAppData } from '../../../services/models/IAppData';
import { IBookmark } from '../../../services/models/IBookmark';

export interface IBookmarkHubState {
  bookmarks: IBookmark[];
  appData: IAppData;
  isGroupPanelOpen: boolean;
  isLabelPanelOpen: boolean;
}
