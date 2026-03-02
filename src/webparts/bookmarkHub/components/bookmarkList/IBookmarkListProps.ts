import { IBookmark } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';

export interface IBookmarkListProps {
  /** Raw bookmarks fetched from the service (unfiltered). */
  bookmarks: IBookmark[];
  /** Bookmarks already saved in AppData — used to filter out already-assigned items. */
  savedBookmarks: IBookmark[];
  /** Available groups to show in the assign-group dropdown. */
  groups: IBookmarkGroup[];
  onAssignGroup: (bookmark: IBookmark, group: IBookmarkGroup) => Promise<void>;
}
