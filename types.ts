export enum Page {
  Onboarding,
  Home,
  Radio,
  News,
  Upload,
  Polls,
  Settings,
  Login,
  Weather,
  Sport,
}

export interface PollOption {
  id: number;
  textKey: string;
  votes: number;
}

export interface Poll {
  id: number;
  questionKey: string;
  options: PollOption[];
  totalVotes: number;
  votedOption?: number;
}
