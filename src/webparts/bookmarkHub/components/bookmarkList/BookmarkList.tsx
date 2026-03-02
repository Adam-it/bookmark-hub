import * as React from 'react';
import styles from './BookmarkList.module.scss';
import {
  DetailsList, IColumn, SelectionMode, Link, Icon,
  MessageBar, MessageBarType, IconButton, Text, Stack,
  Dropdown, IDropdownOption,
} from '@fluentui/react';
import { IBookmark, BookmarkType } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';
import { IBookmarkListProps } from './IBookmarkListProps';

const PAGE_SIZE = 10;

interface IBookmarkListState {
  sortKey: 'title' | 'date' | undefined;
  isSortedDescending: boolean;
  currentPage: number;
}

export default class BookmarkList extends React.Component<IBookmarkListProps, IBookmarkListState> {

  constructor(props: IBookmarkListProps) {
    super(props);
    this.state = {
      sortKey: undefined,
      isSortedDescending: false,
      currentPage: 1,
    };
  }

  // ── helpers ─────────────────────────────────────────────────────────────

  private _getTypeIcon(type: BookmarkType): string {
    switch (type) {
      case BookmarkType.Site:  return 'Globe';
      case BookmarkType.Email: return 'Mail';
      case BookmarkType.File:  return 'Document';
      default:                 return 'Bookmark';
    }
  }

  private _getFilteredBookmarks(): IBookmark[] {
    const { bookmarks, savedBookmarks } = this.props;
    const assignedIds = new Set(
      savedBookmarks
        .filter(bm => bm.groups && bm.groups.length > 0)
        .map(bm => bm.id)
    );
    return bookmarks.filter(bm => !assignedIds.has(bm.id));
  }

  private _getSortedBookmarks(): IBookmark[] {
    const { sortKey, isSortedDescending } = this.state;
    const unassigned = this._getFilteredBookmarks();
    if (!sortKey) return unassigned;
    return [...unassigned].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return isSortedDescending ? -cmp : cmp;
    });
  }

  // ── column header click ──────────────────────────────────────────────────

  private _onColumnHeaderClick = (_ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.key !== 'title' && column.key !== 'date') return;
    const key = column.key as 'title' | 'date';
    const { sortKey, isSortedDescending } = this.state;
    const descending = sortKey === key ? !isSortedDescending : false;
    this.setState({ sortKey: key, isSortedDescending: descending, currentPage: 1 });
  };

  // ── columns ──────────────────────────────────────────────────────────────

  private _getColumns(): IColumn[] {
    const { groups, onAssignGroup } = this.props;
    const { sortKey, isSortedDescending } = this.state;
    const groupOptions: IDropdownOption[] = groups
      .filter(g => !g.archived)
      .map(g => ({ key: g.index, text: g.name }));

    return [
      {
        key: 'type',
        name: 'Type',
        fieldName: 'type',
        minWidth: 36,
        maxWidth: 36,
        onRender: (item: IBookmark) => (
          <Icon
            iconName={this._getTypeIcon(item.type)}
            title={item.type}
            styles={{ root: { fontSize: 16, verticalAlign: 'middle' } }}
          />
        ),
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
        ),
      },
      {
        key: 'description',
        name: 'Description',
        fieldName: 'description',
        minWidth: 180,
        isResizable: true,
        onRender: (item: IBookmark) => <span>{item.description || '—'}</span>,
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
        },
      },
      {
        key: 'group',
        name: 'Assign Group',
        fieldName: 'group',
        minWidth: 160,
        maxWidth: 220,
        onRender: (item: IBookmark) => (
          <Dropdown
            key={item.id}
            placeholder="Assign to group..."
            selectedKey={null}
            options={groupOptions}
            styles={{ root: { minWidth: 150 } }}
            onChange={(_ev, option) => {
              if (!option) return;
              const group = groups.find((g: IBookmarkGroup) => g.index === option.key);
              if (group) { onAssignGroup(item, group).catch(console.error); }
            }}
          />
        ),
      },
    ];
  }

  // ── pagination ───────────────────────────────────────────────────────────

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

  // ── render ───────────────────────────────────────────────────────────────

  public render(): React.ReactElement<IBookmarkListProps> {
    const { currentPage } = this.state;
    const sorted = this._getSortedBookmarks();
    const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Not assigned bookmarks</h2>

        {sorted.length > 0 ? (
          <>
            <DetailsList
              items={paged}
              columns={this._getColumns()}
              selectionMode={SelectionMode.none}
              isHeaderVisible={true}
              className={styles.list}
            />
            {this._renderPagination(sorted.length)}
          </>
        ) : (
          <MessageBar
            messageBarType={MessageBarType.info}
            isMultiline={false}
            className={styles.emptyState}
          >
            No unassigned bookmarks — all bookmarks have been assigned to a group.
          </MessageBar>
        )}
      </div>
    );
  }
}
