import * as React from 'react';
import styles from './ContextHub.module.scss';
import type { IContextHubProps } from './IContextHubProps';
import { IContextHubState } from './IContextHubState';

export default class ContextHub extends React.Component<IContextHubProps, IContextHubState> {

  constructor(props: IContextHubProps | Readonly<IContextHubProps>) {
    super(props);

    this.state = {
      followedSites: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const sites = await this.props.contextHubService.getFollowedSites();
    this.setState({ followedSites: sites });
    console.log('Followed sites:', sites);
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
