import { IBookmark } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';
import { IBookmarkLabel } from '../../../../services/models/IBookmarkLabel';

export interface IBookmarkHubToolbarProps {
  groups: IBookmarkGroup[];
  labels: IBookmarkLabel[];
  bookmarks: IBookmark[];
  onGroupsChanged: (groups: IBookmarkGroup[]) => Promise<void>;
  onLabelsChanged: (labels: IBookmarkLabel[]) => Promise<void>;
  searchQuery: string;
  onSearchChange: (event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => void;
}
