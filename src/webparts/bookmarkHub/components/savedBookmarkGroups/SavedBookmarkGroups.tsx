import * as React from 'react';
import styles from './SavedBookmarkGroups.module.scss';
import {
  DetailsList, IColumn, SelectionMode, Link, Icon,
  IconButton, Text, Stack, Dropdown, IDropdownOption,
} from '@fluentui/react';
import { IBookmark, BookmarkType } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';
import { ISavedBookmarkGroupsProps } from './ISavedBookmarkGroupsProps';

const PAGE_SIZE = 10;

interface IGroupTableState {
  sortKey: 'title' | 'date' | undefined;
  isSortedDescending: boolean;
  currentPage: number;
}

interface ISavedBookmarkGroupsState {
  groupState: Record<number, IGroupTableState>;
}

const defaultGroupState: IGroupTableState = {
  sortKey: undefined,
  isSortedDescending: false,
  currentPage: 1,
};

export default class SavedBookmarkGroups extends React.Component<ISavedBookmarkGroupsProps, ISavedBookmarkGroupsState> {

  constructor(props: ISavedBookmarkGroupsProps) {
    super(props);
    this.state = { groupState: {} };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private _getGroupState(groupIndex: number): IGroupTableState {
    return this.state.groupState[groupIndex] ?? defaultGroupState;
  }

  private _setGroupState(groupIndex: number, patch: Partial<IGroupTableState>): void {
    this.setState(prev => ({
      groupState: {
        ...prev.groupState,
        [groupIndex]: { ...this._getGroupState(groupIndex), ...patch },
      },
    }));
  }

  private _getTypeIcon(type: BookmarkType): string {
    switch (type) {
      case BookmarkType.Site:  return 'Globe';
      case BookmarkType.Email: return 'Mail';
      case BookmarkType.File:  return 'Document';
      default:                 return 'Bookmark';
    }
  }

  // ── columns ──────────────────────────────────────────────────────────────

  private _buildColumns(
    groupIndex: number,
    sortKey: 'title' | 'date' | undefined,
    isSortedDescending: boolean,
  ): IColumn[] {
    const { groups, onAssignGroup, onRemoveBookmark } = this.props;
    const groupOptions: IDropdownOption[] = groups
      .filter(g => !g.archived)
      .map(g => ({ key: g.index, text: g.name }));

    const onColumnClick = (_ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
      if (column.key !== 'title' && column.key !== 'date') return;
      const key = column.key as 'title' | 'date';
      const gs = this._getGroupState(groupIndex);
      const descending = gs.sortKey === key ? !gs.isSortedDescending : false;
      this._setGroupState(groupIndex, { sortKey: key, isSortedDescending: descending, currentPage: 1 });
    };

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
        onColumnClick,
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
        onColumnClick,
        onRender: (item: IBookmark) => {
          const d = new Date(item.date);
          const label = isNaN(d.getTime())
            ? item.date
            : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          return <span>{label}</span>;
        },
      },
      {
        key: 'labels',
        name: 'Labels',
        fieldName: 'labels',
        minWidth: 120,
        maxWidth: 200,
        isResizable: true,
        // TODO: render assigned labels
        onRender: (_item: IBookmark) => <span>—</span>,
      },
      {
        key: 'group',
        name: 'Change Group',
        fieldName: 'group',
        minWidth: 220,
        maxWidth: 300,
        onRender: (item: IBookmark) => (
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
            <Dropdown
              key={item.id}
              placeholder="Change group..."
              selectedKey={null}
              options={groupOptions}
              styles={{ root: { minWidth: 150 } }}
              onChange={(_ev, option) => {
                if (!option) return;
                const group = groups.find((g: IBookmarkGroup) => g.index === option.key);
                if (group) { onAssignGroup(item, group).catch(console.error); }
              }}
            />
            <IconButton
              iconProps={{ iconName: 'Delete' }}
              ariaLabel="Remove bookmark"
              title="Remove from saved bookmarks"
              styles={{ root: { color: '#a4262c' } }}
              onClick={() => onRemoveBookmark(item).catch(console.error)}
            />
          </Stack>
        ),
      },
    ];
  }

  // ── pagination ────────────────────────────────────────────────────────────

  private _renderPagination(groupIndex: number, totalItems: number): React.ReactElement | null {
    const { currentPage } = this._getGroupState(groupIndex);
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} className={styles.pagination}>
        <IconButton
          iconProps={{ iconName: 'ChevronLeft' }}
          ariaLabel="Previous page"
          disabled={currentPage === 1}
          onClick={() => this._setGroupState(groupIndex, { currentPage: currentPage - 1 })}
        />
        <Text variant="medium">{currentPage} / {totalPages}</Text>
        <IconButton
          iconProps={{ iconName: 'ChevronRight' }}
          ariaLabel="Next page"
          disabled={currentPage === totalPages}
          onClick={() => this._setGroupState(groupIndex, { currentPage: currentPage + 1 })}
        />
      </Stack>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  public render(): React.ReactElement<ISavedBookmarkGroupsProps> | null {
    const { savedBookmarks, groups } = this.props;

    const sections = groups
      .filter(g => !g.archived)
      .map(group => ({
        group,
        items: savedBookmarks.filter(bm => bm.groups?.some(g => g.id === group.id)),
      }))
      .filter(s => s.items.length > 0);

    if (sections.length === 0) return null;

    return (
      <>
        {sections.map(({ group, items }) => {
          const gs = this._getGroupState(group.index);
          const sorted = gs.sortKey
            ? [...items].sort((a, b) => {
                let cmp = 0;
                if (gs.sortKey === 'title') cmp = a.title.localeCompare(b.title);
                else if (gs.sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
                return gs.isSortedDescending ? -cmp : cmp;
              })
            : items;
          const paged = sorted.slice((gs.currentPage - 1) * PAGE_SIZE, gs.currentPage * PAGE_SIZE);

          return (
            <div key={group.index} className={styles.groupSection}>
              <Stack horizontal verticalAlign="center" className={styles.groupHeader}>
                <IconButton
                  iconProps={{ iconName: group.collapsed ? 'ChevronRight' : 'ChevronDown' }}
                  ariaLabel={group.collapsed ? 'Expand group' : 'Collapse group'}
                  onClick={() => this.props.onToggleGroupCollapse(group).catch(console.error)}
                />
                <Text variant="mediumPlus" className={styles.groupTitle}>{group.name}</Text>
              </Stack>
              {!group.collapsed && (
                <>
                  <DetailsList
                    items={paged}
                    columns={this._buildColumns(group.index, gs.sortKey, gs.isSortedDescending)}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible={true}
                    className={styles.list}
                  />
                  {this._renderPagination(group.index, sorted.length)}
                </>
              )}
            </div>
          );
        })}
      </>
    );
  }
}
