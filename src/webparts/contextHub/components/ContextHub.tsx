import * as React from 'react';
import styles from './ContextHub.module.scss';
import type { IContextHubProps } from './IContextHubProps';
import FollowedSitesService from '../../../services/FollowedSitesService';
import { IContextHubState } from './IContextHubState';

export default class ContextHub extends React.Component<IContextHubProps, IContextHubState> {

  constructor(props: IContextHubProps | Readonly<IContextHubProps>) {
    super(props);

    this.state = {
      followedSitesService: undefined
    };
  }

  public componentDidMount(): void {
    this.setState({
      followedSitesService: new FollowedSitesService()
    });
  }
  
  public render(): React.ReactElement<IContextHubProps> {
    const { isDarkTheme, hasTeamsContext } = this.props; // TODO: will be needed later

    // example service integration
    const followedSites = this.state.followedSitesService?.getMyFollowedSites() || []; 
    console.log(followedSites); 

    return (
      <section className={styles.contextHub}>
        <div>
          <h2>Context Hub</h2>
        </div>
      </section>
    );
  }
}
