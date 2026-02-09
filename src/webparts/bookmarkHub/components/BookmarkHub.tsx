import * as React from 'react';
import styles from './BookmarkHub.module.scss';
import type { IBookmarkHubProps } from './IBookmarkHubProps';
import { IBookmarkHubState } from './IBookmarkHubState';

export default class BookmarkHub extends React.Component<IBookmarkHubProps, IBookmarkHubState> {

  constructor(props: IBookmarkHubProps | Readonly<IBookmarkHubProps>) {
    super(props);

    this.state = {
      bookmarks: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const bookmarks = await this.props.bookmarkHubService.getAllBookmarks();
    this.setState({ bookmarks });

    // TODO: log now, remove later
    console.log('All bookmarks:', this.state.bookmarks);
  }
  
  public render(): React.ReactElement<IBookmarkHubProps> {
    return (
      <section className={styles.bookmarkHub}>
        <div>
          <h2>Bookmark Hub</h2>
        </div>
      </section>
    );
  }
}
