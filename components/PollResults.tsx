import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PollResultData {
  results: { text: string; count: number }[];
  total_votes: number;
}

interface PollResultsProps {
  poll: PollResultData;
}

const PollResults: React.FC<PollResultsProps> = ({ poll }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs text-white/60 mb-2">{t('totalVotes')}: {poll.total_votes}</p>
      {poll.results
        .sort((a, b) => b.count - a.count)
        .map((res, index) => (
            <div key={index}>
                <div className="flex justify-between text-white/90 mb-1 text-sm">
                    <span className="font-medium">{res.text}</span>
                    <span className="font-semibold">{poll.total_votes > 0 ? ((res.count / poll.total_votes) * 100).toFixed(0) : 0}% ({res.count})</span>
                </div>
                <div className="w-full bg-marine-blue-darkest/50 rounded-full h-2.5">
                    <div className="bg-golden-yellow h-2.5 rounded-full transition-all duration-500" style={{ width: `${poll.total_votes > 0 ? (res.count / poll.total_votes) * 100 : 0}%` }}></div>
                </div>
            </div>
      ))}
    </div>
  );
};

export default PollResults;
