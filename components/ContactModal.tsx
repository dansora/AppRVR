import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(t('contactSubject'));
    const body = encodeURIComponent(
      `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:secretariat@radiovocearomanilor.com?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl relative text-white p-6"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-montserrat text-golden-yellow mb-6">{t('contactModalTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('contactFirstNameLabel')}</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('contactLastNameLabel')}</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">{t('contactEmailLabel')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">{t('contactMessageLabel')}</label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows={5} required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors"
            >
              {t('contactSendButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;