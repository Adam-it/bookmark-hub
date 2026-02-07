import * as React from 'react';
import styles from './ContextHub.module.scss';
import type { IContextHubProps } from './IContextHubProps';
import { IContextHubState } from './IContextHubState';

export default class ContextHub extends React.Component<IContextHubProps, IContextHubState> {

  constructor(props: IContextHubProps | Readonly<IContextHubProps>) {
    super(props);

    this.state = {
      followedSites: [],
      flaggedEmails: []
    };
  }

  public async componentDidMount(): Promise<void> {
    const sites = await this.props.contextHubService.getFollowedSites();
    const emails = await this.props.contextHubService.getFlaggedEmails();
    this.setState({ 
      followedSites: sites,
      flaggedEmails: emails 
    });

    // TODO: log now, remove later
    console.log('Followed sites:', this.state.followedSites);
    console.log('Flagged emails:', this.state.flaggedEmails);
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
