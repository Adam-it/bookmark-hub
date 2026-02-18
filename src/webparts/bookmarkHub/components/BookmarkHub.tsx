import * as React from 'react';
import styles from './BookmarkHub.module.scss';
import { IAppData } from "../../../services/models/IAppData";
import type { IBookmarkHubProps } from './IBookmarkHubProps';
import { IBookmarkHubState } from './IBookmarkHubState';

export default class BookmarkHub extends React.Component<IBookmarkHubProps, IBookmarkHubState> {

  constructor(props: IBookmarkHubProps | Readonly<IBookmarkHubProps>) {
    super(props);

    this.state = {
      bookmarks: [],
      appData: {} as IAppData
    };
  }

  public async componentDidMount(): Promise<void> {
    const [bookmarks, appData] = await Promise.all([
      this.props.bookmarkHubService.getAllBookmarks(),
      this.props.bookmarkHubService.getAppData()
    ]);
    this.setState({ bookmarks, appData });
  }

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
    return (
      <section className={styles.bookmarkHub}>
        <div>
          <h2>Bookmark Hub</h2>

          <h3>Current Bookmarks - from Graph API</h3>
          <button onClick={this._saveAppData}>Save Bookmarks to App Root</button>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(this.state.bookmarks, null, 2)}
          </pre>

          <h3>Saved App Data - from OneDrive App Root</h3>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(this.state.appData, null, 2)}
          </pre>
        </div>
      </section>
    );
  }
}
