import * as React from 'react';
import styles from './BookmarkHub.module.scss';
import { IAppData } from "../../../services/models/IAppData";
import type { IBookmarkHubProps } from './IBookmarkHubProps';
import { IBookmarkHubState } from './IBookmarkHubState';
import { IBookmarkGroup } from '../../../services/models/IBookmarkGroup';
import { IBookmarkLabel } from '../../../services/models/IBookmarkLabel';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { IBookmark } from '../../../services/models/IBookmark';
import BookmarkHubToolbar from './bookmarkHubToolbar/BookmarkHubToolbar';
import BookmarkList from './bookmarkList/BookmarkList';
import SavedBookmarkGroups from './savedBookmarkGroups/SavedBookmarkGroups';
import { CopilotChatService } from '../../../services/CopilotChatService';
import { organizeBookmarksWithCopilot, mergeCopilotSuggestions } from '../../../services/CopilotOrganizeService';

export default class BookmarkHub extends React.Component<IBookmarkHubProps, IBookmarkHubState> {

  constructor(props: IBookmarkHubProps | Readonly<IBookmarkHubProps>) {
    super(props);

    this.state = {
      bookmarks: [],
      appData: { bookmarks: [], groups: [], labels: [] },
      isLoading: true,
      hasCopilotSuggestions: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    const [bookmarks, appData] = await Promise.all([
      this.props.bookmarkHubService.getAllBookmarks(),
      this.props.bookmarkHubService.getAppData(),
      CopilotChatService.init(this.props.context.msGraphClientFactory),
    ]);
    this.setState({ bookmarks, appData, isLoading: false });
  }

  private _onAssignGroup = async (bookmark: IBookmark, group: IBookmarkGroup): Promise<void> => {
    const { appData } = this.state;
    const existingBookmarks = appData?.bookmarks ?? [];
    const existingIndex = existingBookmarks.findIndex(bm => bm.id === bookmark.id);
    const updatedBookmark: IBookmark = { ...bookmark, groups: [group] };
    const updatedBookmarks = existingIndex >= 0
      ? existingBookmarks.map((bm, i) => i === existingIndex ? updatedBookmark : bm)
      : [...existingBookmarks, updatedBookmark];
    const updatedAppData: IAppData = { ...appData, bookmarks: updatedBookmarks };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error assigning group:', error);
    }
  };

  private _onRemoveBookmark = async (bookmark: IBookmark): Promise<void> => {
    const { appData } = this.state;
    const updatedBookmarks = (appData?.bookmarks ?? []).filter(bm => bm.id !== bookmark.id);
    const updatedAppData: IAppData = { ...appData, bookmarks: updatedBookmarks };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  private _onLabelsChanged = async (labels: IBookmarkLabel[]): Promise<void> => {
    const updatedAppData: IAppData = { ...this.state.appData, labels };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error saving labels:', error);
    }
  };

  private _onAssignLabels = async (bookmark: IBookmark, labels: IBookmarkLabel[]): Promise<void> => {
    const { appData } = this.state;
    const existingBookmarks = appData?.bookmarks ?? [];
    const existingIndex = existingBookmarks.findIndex(bm => bm.id === bookmark.id);
    const updatedBookmark: IBookmark = { ...bookmark, labels };
    const updatedBookmarks = existingIndex >= 0
      ? existingBookmarks.map((bm, i) => i === existingIndex ? updatedBookmark : bm)
      : [...existingBookmarks, updatedBookmark];
    const updatedAppData: IAppData = { ...appData, bookmarks: updatedBookmarks };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error assigning labels:', error);
    }
  };

  private _onRemoveLabel = async (bookmark: IBookmark, labelToRemove: IBookmarkLabel): Promise<void> => {
    const { appData } = this.state;
    const existingBookmarks = appData?.bookmarks ?? [];
    const existingIndex = existingBookmarks.findIndex(bm => bm.id === bookmark.id);
    if (existingIndex < 0) return;
    
    const updatedLabels = (bookmark.labels ?? []).filter(l => l.name !== labelToRemove.name);
    const updatedBookmark: IBookmark = { ...bookmark, labels: updatedLabels };
    const updatedBookmarks = existingBookmarks.map((bm, i) => i === existingIndex ? updatedBookmark : bm);
    const updatedAppData: IAppData = { ...appData, bookmarks: updatedBookmarks };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error removing label:', error);
    }
  };

  private _onToggleGroupCollapse = async (group: IBookmarkGroup): Promise<void> => {
    const { appData } = this.state;
    const updatedGroups = (appData?.groups ?? []).map(g =>
      g.id === group.id ? { ...g, collapsed: !g.collapsed } : g
    );
    const updatedAppData: IAppData = { ...appData, groups: updatedGroups };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error toggling group collapse:', error);
    }
  };

  private _onGroupsChanged = async (groups: IBookmarkGroup[]): Promise<void> => {
    const updatedAppData: IAppData = { ...this.state.appData, groups };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  };

  private _onSummarizeWithCopilot = async (): Promise<void> => {
    const { appData, bookmarks } = this.state;
    const result = await organizeBookmarksWithCopilot(bookmarks, appData);
    if (result.success && result.organizedAppData) {
      const mergedAppData = mergeCopilotSuggestions(appData, result.organizedAppData);
      // Don't persist yet — wait for user to Approve
      this.setState({ appData: mergedAppData, hasCopilotSuggestions: true });
    }
  };

  private _onCopilotApprove = async (): Promise<void> => {
    const { appData } = this.state;
    const approvedAppData: IAppData = {
      ...appData,
      bookmarks: appData.bookmarks.map(bm => ({ ...bm, suggestion: false })),
      groups: appData.groups.map(g => ({ ...g, suggestion: false })),
    };
    this.setState({ appData: approvedAppData, hasCopilotSuggestions: false });
    try {
      await this.props.bookmarkHubService.saveAppData(approvedAppData);
    } catch (error) {
      console.error('[Copilot] Error saving approved data:', error);
    }
  };

  private _onCopilotDecline = async (): Promise<void> => {
    const { appData } = this.state;
    const cleanedAppData: IAppData = {
      ...appData,
      bookmarks: appData.bookmarks.filter(bm => !bm.suggestion),
      groups: appData.groups.filter(g => !g.suggestion),
    };
    this.setState({ appData: cleanedAppData, hasCopilotSuggestions: false });
    try {
      await this.props.bookmarkHubService.saveAppData(cleanedAppData);
    } catch (error) {
      console.error('[Copilot] Error saving after decline:', error);
    }
  };

  private _onCopilotRetry = async (): Promise<void> => {
    const { appData, bookmarks } = this.state;
    // Clean up previous suggestions first (in memory, don't persist yet)
    const cleanedAppData: IAppData = {
      ...appData,
      bookmarks: appData.bookmarks.filter(bm => !bm.suggestion),
      groups: appData.groups.filter(g => !g.suggestion),
    };
    this.setState({ appData: cleanedAppData, hasCopilotSuggestions: false });
    // Re-run with the cleaned state
    const result = await organizeBookmarksWithCopilot(bookmarks, cleanedAppData);
    if (result.success && result.organizedAppData) {
      const mergedAppData = mergeCopilotSuggestions(cleanedAppData, result.organizedAppData);
      this.setState({ appData: mergedAppData, hasCopilotSuggestions: true });
    }
  };

  public render(): React.ReactElement<IBookmarkHubProps> {
    const { bookmarks, appData, isLoading } = this.state;

    return (
      <section className={styles.bookmarkHub}>
        <div>
          <BookmarkHubToolbar
            groups={appData?.groups ?? []}
            labels={appData?.labels ?? []}
            bookmarks={appData?.bookmarks ?? []}
            onGroupsChanged={this._onGroupsChanged}
            onLabelsChanged={this._onLabelsChanged}
          />

          {isLoading ? (
            <Spinner
              size={SpinnerSize.large}
              label="Loading bookmarks..."
              className={styles.spinner}
            />
          ) : (
            <BookmarkList
              bookmarks={bookmarks}
              savedBookmarks={appData?.bookmarks ?? []}
              groups={appData?.groups ?? []}
              availableLabels={appData?.labels ?? []}
              onAssignGroup={this._onAssignGroup}
              onOrganizeWithCopilot={this._onSummarizeWithCopilot}
              hasCopilotSuggestions={this.state.hasCopilotSuggestions}
              onCopilotApprove={this._onCopilotApprove}
              onCopilotDecline={this._onCopilotDecline}
              onCopilotRetry={this._onCopilotRetry}
              onAssignLabels={this._onAssignLabels}
              onRemoveLabel={this._onRemoveLabel}
            />
          )}

          {!isLoading && (
            <SavedBookmarkGroups
              savedBookmarks={appData?.bookmarks ?? []}
              groups={appData?.groups ?? []}
              availableLabels={appData?.labels ?? []}
              onAssignGroup={this._onAssignGroup}
              onRemoveBookmark={this._onRemoveBookmark}
              onToggleGroupCollapse={this._onToggleGroupCollapse}
              onAssignLabels={this._onAssignLabels}
              onRemoveLabel={this._onRemoveLabel}
            />
          )}

          {/* Temporary view to remove later */}
          {/* <h3>Saved App Data - from OneDrive App Root</h3>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(appData, null, 2)}
          </pre> */}
          {/* Temporary view to remove later */}
        </div>
      </section>
    );
  }
}
