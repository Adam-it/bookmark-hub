import { IAppData } from '../../../services/models/IAppData';
import { IBookmark } from '../../../services/models/IBookmark';

export interface IBookmarkHubState {
  bookmarks: IBookmark[];
  appData: IAppData;
  isLoading: boolean;
  isGroupPanelOpen: boolean;
  isLabelPanelOpen: boolean;
  sortKey: 'title' | 'date' | undefined;
  isSortedDescending: boolean;
  currentPage: number;
}
