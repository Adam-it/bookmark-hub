import * as React from 'react';
import styles from './SavedBookmarkGroups.module.scss';
import {
  DetailsList, IColumn, SelectionMode, Link, Icon,
  IconButton, Text, Stack, Dropdown, IDropdownOption,
  DetailsRow, IDetailsRowProps,
} from '@fluentui/react';
import { IBookmark, BookmarkType } from '../../../../services/models/IBookmark';
import { IBookmarkGroup } from '../../../../services/models/IBookmarkGroup';
import { IBookmarkLabel } from '../../../../services/models/IBookmarkLabel';
import { ISavedBookmarkGroupsProps } from './ISavedBookmarkGroupsProps';
import { BookmarkLabel } from '../shared/BookmarkLabel';
import { LabelSelector } from '../shared/LabelSelector';

const PAGE_SIZE = 10;

interface IGroupTableState {
  sortKey: 'title' | 'date' | undefined;
  isSortedDescending: boolean;
  currentPage: number;
}

interface ISavedBookmarkGroupsState {
  groupState: Record<number, IGroupTableState>;
  labelSelectorTarget: HTMLElement | undefined;
  selectedBookmark: IBookmark | undefined;
}

const defaultGroupState: IGroupTableState = {
  sortKey: undefined,
  isSortedDescending: false,
  currentPage: 1,
};

export default class SavedBookmarkGroups extends React.Component<ISavedBookmarkGroupsProps, ISavedBookmarkGroupsState> {

  constructor(props: ISavedBookmarkGroupsProps) {
    super(props);
    this.state = { 
      groupState: {},
      labelSelectorTarget: undefined,
      selectedBookmark: undefined
    };
  }

  public componentDidUpdate(prevProps: ISavedBookmarkGroupsProps): void {
    // Reset all groups to page 1 when search query changes
    if (prevProps.searchQuery !== this.props.searchQuery) {
      const resetGroupState: Record<number, IGroupTableState> = {};
      Object.keys(this.state.groupState).forEach(key => {
        const groupIndex = Number(key);
        resetGroupState[groupIndex] = { ...this.state.groupState[groupIndex], currentPage: 1 };
      });
      this.setState({ groupState: resetGroupState });
    }
  }

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

  private _buildColumns(
    groupIndex: number,
    sortKey: 'title' | 'date' | undefined,
    isSortedDescending: boolean,
  ): IColumn[] {
    const { groups, onAssignGroup, onRemoveBookmark, onRemoveLabel } = this.props;
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
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        onRender: (item: IBookmark) => {
          const handleRemoveLabel = (label: IBookmarkLabel): void => {
            onRemoveLabel(item, label).catch(console.error);
          };
          return (
            <Stack horizontal wrap tokens={{ childrenGap: 4 }} verticalAlign="center">
              {(item.labels ?? []).map((label) => (
                <BookmarkLabel
                  key={label.name}
                  label={label}
                  onRemove={handleRemoveLabel}
                />
              ))}
              <IconButton
                iconProps={{ iconName: 'Add' }}
                title="Add labels"
                ariaLabel="Add labels"
                styles={{ root: { height: 20, width: 20 } }}
                onClick={(e) => {
                  this.setState({
                    labelSelectorTarget: e.currentTarget as HTMLElement,
                    selectedBookmark: item
                  });
                }}
              />
            </Stack>
          );
        },
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

  // eslint-disable-next-line @rushstack/no-new-null
  public render(): React.ReactElement<ISavedBookmarkGroupsProps> | null {
    const { savedBookmarks, groups, availableLabels, onAssignLabels, searchQuery } = this.props;
    const { labelSelectorTarget, selectedBookmark } = this.state;

    const sections = groups
      .filter(g => !g.archived)
      .map(group => {
        let items = savedBookmarks.filter(bm => bm.groups?.some(g => g.id === group.id));
        
        if (searchQuery && searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          items = items.filter(bm => bm.title.toLowerCase().includes(query));
        }
        
        return { group, items };
      })
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
                <Text variant="mediumPlus" className={group.suggestion ? styles.suggestionGroupTitle : styles.groupTitle}>{group.name}</Text>
                {group.suggestion && (
                  <Icon iconName="Lightbulb" title="Copilot suggestion" styles={{ root: { color: '#f0a500', marginLeft: 6 } }} />
                )}
              </Stack>
              {!group.collapsed && (
                <>
                  <DetailsList
                    items={paged}
                    columns={this._buildColumns(group.index, gs.sortKey, gs.isSortedDescending)}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible={true}
                    className={styles.list}
                    onRenderRow={(rowProps: IDetailsRowProps | undefined) => {
                      if (!rowProps) return null;
                      const item = rowProps.item as IBookmark;
                      return (
                        <DetailsRow
                          {...rowProps}
                          styles={item.suggestion ? {
                            root: { borderLeft: '3px solid #f0a500', backgroundColor: '#fffcf0' }
                          } : undefined}
                        />
                      );
                    }}
                  />
                  {this._renderPagination(group.index, sorted.length)}
                </>
              )}
            </div>
          );
        })}
        
        {labelSelectorTarget && selectedBookmark && (
          <LabelSelector
            targetElement={labelSelectorTarget}
            availableLabels={availableLabels}
            selectedLabels={selectedBookmark.labels ?? []}
            onDismiss={() => this.setState({ labelSelectorTarget: undefined, selectedBookmark: undefined })}
            onApply={(selectedLabels) => {
              onAssignLabels(selectedBookmark, selectedLabels).catch(console.error);
            }}
          />
        )}
      </>
    );
  }
}
