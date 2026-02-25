import { IBookmarkLabel } from '../../../../services/models/IBookmarkLabel';

export interface IBookmarkLabelManagerProps {
  labels: IBookmarkLabel[];
  onLabelsChanged: (labels: IBookmarkLabel[]) => void;
}
