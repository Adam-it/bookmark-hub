import { IBookmark } from '../../../services/models/IBookmark';

export interface IBookmarkHubState {
  bookmarks: IBookmark[];
  savedBookmarks: IBookmark[];
}
