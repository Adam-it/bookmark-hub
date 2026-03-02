import { IBookmark } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';

export interface ISavedBookmarkGroupsProps {
  /** All bookmarks saved in AppData (assigned ones). */
  savedBookmarks: IBookmark[];
  /** All available groups (used both for filtering sections and for the reassign dropdown). */
  groups: IBookmarkGroup[];
  onAssignGroup: (bookmark: IBookmark, group: IBookmarkGroup) => Promise<void>;
  onRemoveBookmark: (bookmark: IBookmark) => Promise<void>;
}
