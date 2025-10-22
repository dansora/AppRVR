import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Polls: React.FC = () => {
  const { t } = useLanguage();

  // Mock data for polls
  const polls = [
    {
      id: 1,
      question: t('poll1Question'),
      options: [
        { id: 'a', text: t('poll1Option1') },
        { id: 'b', text: t('poll1Option2') },
        { id: 'c', text: t('poll1Option3') },
      ],
      voted: false,
    },
    {
      id: 2,
      question: t('poll2Question'),
      options: [
        { id: 'a', text: t('poll2Option1') },
        { id: 'b', text: t('poll2Option2') },
      ],
      voted: true,
      results: [65, 35]
    },
  ];

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('navPolls')}</h1>
      <div className="space-y-6">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-montserrat text-white mb-4">{poll.question}</h2>
            {poll.voted ? (
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={option.id}>
                    <div className="flex justify-between text-white/90 mb-1">
                      <span>{option.text}</span>
                      <span>{poll.results?.[index]}%</span>
                    </div>
                    <div className="w-full bg-marine-blue-darkest/50 rounded-full h-2.5">
                      <div className="bg-golden-yellow h-2.5 rounded-full" style={{ width: `${poll.results?.[index]}%` }}></div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-golden-yellow mt-4 text-center">{t('pollVoted')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {poll.options.map(option => (
                  <button key={option.id} className="w-full bg-marine-blue-darkest/50 p-3 rounded-md text-left text-white hover:bg-marine-blue-darkest transition-colors">
                    {option.text}
                  </button>
                ))}
                <button className="w-full mt-4 bg-golden-yellow text-marine-blue font-bold py-2 px-4 rounded-full hover:bg-yellow-400 transition-colors">
                  {t('pollVoteButton')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Polls;
