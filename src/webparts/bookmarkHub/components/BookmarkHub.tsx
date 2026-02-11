import * as React from 'react';
import styles from './BookmarkHub.module.scss';
import type { IBookmarkHubProps } from './IBookmarkHubProps';
import { IBookmarkHubState } from './IBookmarkHubState';

export default class BookmarkHub extends React.Component<IBookmarkHubProps, IBookmarkHubState> {

  constructor(props: IBookmarkHubProps | Readonly<IBookmarkHubProps>) {
    super(props);

    this.state = {
      bookmarks: [],
      savedBookmarks: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const [bookmarks, savedBookmarks] = await Promise.all([
      this.props.bookmarkHubService.getAllBookmarks(),
      this.props.bookmarkHubService.getBookmarksFromAppRoot()
    ]);
    this.setState({ bookmarks, savedBookmarks });
  }

  // TODO: added for testing - need to implement UI for saving bookmarks in the future
  private _saveBookmarks = async (): Promise<void> => {
    try {
      const { bookmarks } = this.state;
      await this.props.bookmarkHubService.saveBookmarksToAppRoot(bookmarks);
      this.setState({ savedBookmarks: bookmarks });
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  // TODO: added for testing - need to implement UI for rendering and saving bookmarks in the future
  public render(): React.ReactElement<IBookmarkHubProps> {
    return (
      <section className={styles.bookmarkHub}>
        <div>
          <h2>Bookmark Hub</h2>

          <h3>Current Bookmarks - from Graph API</h3>
          <button onClick={this._saveBookmarks}>Save Bookmarks to App Root</button>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(this.state.bookmarks, null, 2)}
          </pre>

          <h3>Saved Bookmarks - from OneDrive App Root</h3>
          <pre className={styles.bookmarkHubPre}>
            {JSON.stringify(this.state.savedBookmarks, null, 2)}
          </pre>
        </div>
      </section>
    );
  }
}
