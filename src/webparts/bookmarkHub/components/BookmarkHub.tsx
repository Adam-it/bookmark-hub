import * as React from 'react';
import styles from './BookmarkHub.module.scss';
import { IAppData } from "../../../services/models/IAppData";
import type { IBookmarkHubProps } from './IBookmarkHubProps';
import { IBookmarkHubState } from './IBookmarkHubState';
import { IBookmarkGroup } from '../../../services/models/IBookmarkGroup';
import { IBookmarkLabel } from '../../../services/models/IBookmarkLabel';
import { DefaultButton, Panel, PanelType, Stack, IStackTokens } from '@fluentui/react';
import BookmarkGroupManager from './bookmarkGroupManager/BookmarkGroupManager';
import BookmarkLabelManager from './bookmarkLabelManager/BookmarkLabelManager';

const toolbarTokens: IStackTokens = { childrenGap: 8 };

export default class BookmarkHub extends React.Component<IBookmarkHubProps, IBookmarkHubState> {

  constructor(props: IBookmarkHubProps | Readonly<IBookmarkHubProps>) {
    super(props);

    this.state = {
      bookmarks: [],
      appData: {} as IAppData,
      isGroupPanelOpen: false,
      isLabelPanelOpen: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    const [bookmarks, appData] = await Promise.all([
      this.props.bookmarkHubService.getAllBookmarks(),
      this.props.bookmarkHubService.getAppData()
    ]);
    this.setState({ bookmarks, appData });
  }

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

  // TODO: added for testing - need to implement UI for rendering and saving bookmarks in the future
  public render(): React.ReactElement<IBookmarkHubProps> {
    const { bookmarks, appData, isGroupPanelOpen, isLabelPanelOpen } = this.state;

    return (
      <section className={styles.bookmarkHub}>
        <div>
          <h2>Bookmark Hub</h2>

          <Stack horizontal tokens={toolbarTokens}>
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

          <h3>Current Bookmarks - from Graph API</h3>
          <button onClick={this._saveAppData}>Save Bookmarks to App Root</button>
          {bookmarks && bookmarks.length > 0 ? (
            <table className={styles.bookmarkTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Date</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {bookmarks.map((bm, idx) => (
                  <tr key={bm.id || idx}>
                    <td>{bm.title}</td>
                    <td><a href={bm.url} target="_blank" rel="noopener noreferrer">{bm.url}</a></td>
                    <td>{bm.date}</td>
                    <td>{bm.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bookmarks to display</p>
          )}

          <h3>Saved App Data - from OneDrive App Root</h3>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(appData, null, 2)}
          </pre>
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
