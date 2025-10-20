import React, { useState } from 'react';
import { MOCK_POLLS } from '../constants';
import { Poll } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Polls: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS);
  const { t } = useLanguage();

  const handleVote = (pollId: number, optionId: number) => {
    setPolls(prevPolls =>
      prevPolls.map(poll => {
        if (poll.id === pollId && poll.votedOption === undefined) {
          const newOptions = poll.options.map(option =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          );
          return {
            ...poll,
            options: newOptions,
            totalVotes: poll.totalVotes + 1,
            votedOption: optionId,
          };
        }
        return poll;
      })
    );
  };

  return (
    <div className="p-4 text-white font-roboto">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('pollsTitle')}</h1>
      <div className="space-y-8">
        {polls.map(poll => (
          <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg">
            <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t(poll.questionKey)}</h2>
            <div className="space-y-3">
              {poll.options.map(option => {
                const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                return (
                  <div key={option.id}>
                    {poll.votedOption !== undefined ? (
                      <div className="relative h-10 flex items-center justify-between px-4 bg-marine-blue/50 rounded-md overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-golden-yellow/30"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <span className="relative z-10 font-medium">{t(option.textKey)}</span>
                        <span className="relative z-10 font-bold">{percentage.toFixed(1)}%</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVote(poll.id, option.id)}
                        className="w-full text-left bg-marine-blue-darkest/50 p-3 rounded-md hover:brightness-110 transition-all"
                      >
                        {t(option.textKey)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-right text-sm text-white/60 mt-4">{poll.totalVotes} {t('pollsVotes')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Polls;