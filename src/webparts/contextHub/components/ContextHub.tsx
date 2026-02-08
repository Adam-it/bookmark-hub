import * as React from 'react';
import styles from './ContextHub.module.scss';
import type { IContextHubProps } from './IContextHubProps';
import { IContextHubState } from './IContextHubState';

export default class ContextHub extends React.Component<IContextHubProps, IContextHubState> {

  constructor(props: IContextHubProps | Readonly<IContextHubProps>) {
    super(props);

    this.state = {
      bookmarks: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const bookmarks = await this.props.contextHubService.getAllBookmarks();
    this.setState({ bookmarks });

    // TODO: log now, remove later
    console.log('All bookmarks:', this.state.bookmarks);
  }
  
  public render(): React.ReactElement<IContextHubProps> {
    return (
      <section className={styles.contextHub}>
        <div>
          <h2>Context Hub</h2>
        </div>
      </section>
    );
  }
}
