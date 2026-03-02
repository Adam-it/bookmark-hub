import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';
import { IBookmarkLabel } from '../../../../services/models/IBookmarkLabel';

export interface IBookmarkHubToolbarProps {
  groups: IBookmarkGroup[];
  labels: IBookmarkLabel[];
  onGroupsChanged: (groups: IBookmarkGroup[]) => Promise<void>;
  onLabelsChanged: (labels: IBookmarkLabel[]) => Promise<void>;
}
