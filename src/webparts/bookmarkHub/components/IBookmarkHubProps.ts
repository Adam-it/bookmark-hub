import { BookmarkHubService } from "../../../services/BookmarkHubService";

export interface IBookmarkHubProps {
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  bookmarkHubService: BookmarkHubService;
}
