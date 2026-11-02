import { useCallback } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../context/ToastContext';
import { playTone } from '../lib/audio';
import { copyToClipboard } from '../lib/clipboard';
import { PROFILE, RESUME_URL } from '../lib/profile';

/** Actions shared by the header, hero, contact section and command palette. */
export function usePortfolioActions() {
  const toast = useToast();
  const { track } = useAnalytics();

  const copyText = useCallback(
    async (value: string, message: string, label = 'text') => {
      playTone(600);
      const ok = await copyToClipboard(value);
      if (ok) {
        toast(message);
        track('contact_copy', label);
      } else {
        toast('Copy failed. Please copy it manually.', 'error');
      }
    },
    [toast, track],
  );

  const requestResume = useCallback(() => {
    playTone(640);
    track('resume_request');
    toast('Opening resume in a new tab...');
    window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
  }, [toast, track]);

  const copyProfileSpec = useCallback(() => {
    const spec = JSON.stringify(
      {
        candidate: PROFILE.name,
        college: 'Birla Institute of Technology, Patna',
        degree: 'B.Tech in Mechanical Engineering (2023-2027)',
        cgpa: 7.3,
        research: 'IIT (BHU) Varanasi CoE-MTD',
        email: PROFILE.email,
        phone: PROFILE.phoneHyphen,
        github: PROFILE.github,
        linkedin: PROFILE.linkedin,
      },
      null,
      2,
    );
    void copyText(spec, 'Candidate JSON Spec copied to clipboard!', 'spec');
  }, [copyText]);

  return { copyText, requestResume, copyProfileSpec };
}
