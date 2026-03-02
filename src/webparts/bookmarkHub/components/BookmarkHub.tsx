import * as React from 'react';
import styles from './BookmarkHub.module.scss';
import { IAppData } from "../../../services/models/IAppData";
import type { IBookmarkHubProps } from './IBookmarkHubProps';
import { IBookmarkHubState } from './IBookmarkHubState';
import { IBookmarkGroup } from '../../../services/models/IBookmarkGroup';
import { IBookmarkLabel } from '../../../services/models/IBookmarkLabel';
import { DefaultButton, Panel, PanelType, Stack, IStackTokens, DetailsList, IColumn, SelectionMode, Link, Icon, MessageBar, MessageBarType, Spinner, SpinnerSize, IconButton, Text } from '@fluentui/react';
import { IBookmark, BookmarkType } from '../../../services/models/IBookmark';
import BookmarkGroupManager from './bookmarkGroupManager/BookmarkGroupManager';
import BookmarkLabelManager from './bookmarkLabelManager/BookmarkLabelManager';

const toolbarTokens: IStackTokens = { childrenGap: 8 };
const PAGE_SIZE = 10;

export default class BookmarkHub extends React.Component<IBookmarkHubProps, IBookmarkHubState> {

  constructor(props: IBookmarkHubProps | Readonly<IBookmarkHubProps>) {
    super(props);

    this.state = {
      bookmarks: [],
      appData: {} as IAppData,
      isLoading: true,
      isGroupPanelOpen: false,
      isLabelPanelOpen: false,
      sortKey: undefined,
      isSortedDescending: false,
      currentPage: 1,
    };
  }

  public async componentDidMount(): Promise<void> {
    const [bookmarks, appData] = await Promise.all([
      this.props.bookmarkHubService.getAllBookmarks(),
      this.props.bookmarkHubService.getAppData()
    ]);
    this.setState({ bookmarks, appData, isLoading: false });
  }

  private _getBookmarkTypeIcon(type: BookmarkType): string {
    switch (type) {
      case BookmarkType.Site:  return 'Globe';
      case BookmarkType.Email: return 'Mail';
      case BookmarkType.File:  return 'Document';
      default:                 return 'Bookmark';
    }
  }

  private _getColumns(): IColumn[] {
    const { sortKey, isSortedDescending } = this.state;
    return [
      {
        key: 'type',
        name: 'Type',
        fieldName: 'type',
        minWidth: 36,
        maxWidth: 36,
        onRender: (item: IBookmark) => (
          <Icon
            iconName={this._getBookmarkTypeIcon(item.type)}
            title={item.type}
            styles={{ root: { fontSize: 16, verticalAlign: 'middle' } }}
          />
        )
      },
      {
        key: 'title',
        name: 'Title',
        fieldName: 'title',
        minWidth: 150,
        maxWidth: 260,
        isResizable: true,
        isSorted: sortKey === 'title',
        isSortedDescending: sortKey === 'title' && isSortedDescending,
        onColumnClick: this._onColumnHeaderClick,
        onRender: (item: IBookmark) => (
          <Link href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
          </Link>
        )
      },
      {
        key: 'description',
        name: 'Description',
        fieldName: 'description',
        minWidth: 180,
        isResizable: true,
        onRender: (item: IBookmark) => (
          <span>{item.description || '—'}</span>
        )
      },
      {
        key: 'date',
        name: 'Date',
        fieldName: 'date',
        minWidth: 100,
        maxWidth: 120,
        isSorted: sortKey === 'date',
        isSortedDescending: sortKey === 'date' && isSortedDescending,
        onColumnClick: this._onColumnHeaderClick,
        onRender: (item: IBookmark) => {
          const d = new Date(item.date);
          const label = isNaN(d.getTime())
            ? item.date
            : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          return <span>{label}</span>;
        }
      }
    ];
  }

  private _onColumnHeaderClick = (_ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.key !== 'title' && column.key !== 'date') return;
    const key = column.key as 'title' | 'date';
    const { sortKey, isSortedDescending } = this.state;
    const descending = sortKey === key ? !isSortedDescending : false;
    this.setState({ sortKey: key, isSortedDescending: descending, currentPage: 1 });
  };

  private _openGroupPanel = (): void => this.setState({ isGroupPanelOpen: true });
  private _closeGroupPanel = (): void => this.setState({ isGroupPanelOpen: false });

  private _openLabelPanel = (): void => this.setState({ isLabelPanelOpen: true });
  private _closeLabelPanel = (): void => this.setState({ isLabelPanelOpen: false });

  private _onLabelsChanged = async (labels: IBookmarkLabel[]): Promise<void> => {
    const updatedAppData: IAppData = { ...this.state.appData, labels };
    this.setState({ appData: updatedAppData });
    try {
      await this.props.bookmarkHubService.saveAppData(updatedAppData);
    } catch (error) {
      console.error('Error saving labels:', error);
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

  // TODO: added for testing - need to implement UI for saving bookmarks in the future
  private _saveAppData = async (): Promise<void> => {
    try {
      const { appData } = this.state;
      await this.props.bookmarkHubService.saveAppData(appData!);
      this.setState({ appData });
    } catch (error) {
      console.error('Error saving app data:', error);
    }
  }

  private _renderPagination(totalItems: number): React.ReactElement | null {
    const { currentPage } = this.state;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} className={styles.pagination}>
        <IconButton
          iconProps={{ iconName: 'ChevronLeft' }}
          ariaLabel="Previous page"
          disabled={currentPage === 1}
          onClick={() => this.setState({ currentPage: currentPage - 1 })}
        />
        <Text variant="medium">{currentPage} / {totalPages}</Text>
        <IconButton
          iconProps={{ iconName: 'ChevronRight' }}
          ariaLabel="Next page"
          disabled={currentPage === totalPages}
          onClick={() => this.setState({ currentPage: currentPage + 1 })}
        />
      </Stack>
    );
  }

  private _getSortedBookmarks(): IBookmark[] {
    const { bookmarks, sortKey, isSortedDescending } = this.state;
    if (!sortKey) return bookmarks;
    return [...bookmarks].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortKey === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return isSortedDescending ? -cmp : cmp;
    });
  }

  // TODO: added for testing - need to implement UI for rendering and saving bookmarks in the future
  public render(): React.ReactElement<IBookmarkHubProps> {
    const { bookmarks, appData, isLoading, isGroupPanelOpen, isLabelPanelOpen, currentPage } = this.state;
    const sortedBookmarks = this._getSortedBookmarks();
    const pagedBookmarks = sortedBookmarks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
      <section className={styles.bookmarkHub}>
        <div>
          <h2>Bookmark Hub</h2>

          <Stack horizontal tokens={toolbarTokens} horizontalAlign="end">
            <DefaultButton
              iconProps={{ iconName: 'GroupList' }}
              text="Manage Groups"
              onClick={this._openGroupPanel}
            />
            <DefaultButton
              iconProps={{ iconName: 'Tag' }}
              text="Manage Labels"
              onClick={this._openLabelPanel}
            />
          </Stack>

          {isLoading ? (
            <Spinner
              size={SpinnerSize.large}
              label="Loading bookmarks..."
              className={styles.spinner}
            />
          ) : bookmarks.length > 0 ? (
            <>
              <DetailsList
                items={pagedBookmarks}
                columns={this._getColumns()}
                selectionMode={SelectionMode.none}
                isHeaderVisible={true}
                className={styles.bookmarkList}
              />
              {this._renderPagination(sortedBookmarks.length)}
            </>
          ) : (
            <MessageBar
              messageBarType={MessageBarType.info}
              isMultiline={false}
              className={styles.emptyState}
            >
              No bookmarks yet — add some to see them here.
            </MessageBar>
          )}

          {/* Temporary view to remove later */}
          <h3>Saved App Data - from OneDrive App Root</h3>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(appData, null, 2)}
          </pre>
          {/* Temporary view to remove later */}
        </div>

        <Panel
          isOpen={isGroupPanelOpen}
          onDismiss={this._closeGroupPanel}
          type={PanelType.medium}
          headerText="Manage Groups"
          isBlocking={false}
          closeButtonAriaLabel="Close"
        >
          <BookmarkGroupManager
            groups={appData?.groups ?? []}
            onGroupsChanged={this._onGroupsChanged}
          />
        </Panel>

        <Panel
          isOpen={isLabelPanelOpen}
          onDismiss={this._closeLabelPanel}
          type={PanelType.medium}
          headerText="Manage Labels"
          isBlocking={false}
          closeButtonAriaLabel="Close"
        >
          <BookmarkLabelManager
            labels={appData?.labels ?? []}
            onLabelsChanged={this._onLabelsChanged}
          />
        </Panel>
      </section>
    );
  }
}
