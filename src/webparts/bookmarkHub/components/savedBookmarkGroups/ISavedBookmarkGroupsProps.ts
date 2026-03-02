import { IBookmark } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';

export interface ISavedBookmarkGroupsProps {
  savedBookmarks: IBookmark[];
  groups: IBookmarkGroup[];
  onAssignGroup: (bookmark: IBookmark, group: IBookmarkGroup) => Promise<void>;
  onRemoveBookmark: (bookmark: IBookmark) => Promise<void>;
  onToggleGroupCollapse: (group: IBookmarkGroup) => Promise<void>;
}
