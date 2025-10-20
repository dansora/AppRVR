import { Poll } from './types';

export const MOCK_POLLS: Poll[] = [
    {
      id: 1,
      questionKey: "poll1_question",
      options: [
        { id: 1, textKey: 'poll1_option1', votes: 120 },
        { id: 2, textKey: 'poll1_option2', votes: 250 },
        { id: 3, textKey: 'poll1_option3', votes: 80 },
        { id: 4, textKey: 'poll1_option4', votes: 55 },
      ],
      totalVotes: 505,
    },
    {
      id: 2,
      questionKey: 'poll2_question',
      options: [
        { id: 1, textKey: 'poll2_option1', votes: 300 },
        { id: 2, textKey: 'poll2_option2', votes: 150 },
        { id: 3, textKey: 'poll2_option3', votes: 180 },
      ],
      totalVotes: 630,
    },
  ];