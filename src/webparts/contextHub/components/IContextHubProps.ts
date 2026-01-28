import { ContextHubService } from "../../../services/ContextHubService";

export interface IContextHubProps {
  isDarkTheme: boolean;
  hasTeamsContext: boolean;
  contextHubService: ContextHubService;
}
