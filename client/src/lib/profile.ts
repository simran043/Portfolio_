/** Contact details shown on the page, kept in one place. */
export const PROFILE = {
  name: 'Simran Kumari',
  email: 'simrankumariltr@gmail.com',
  phoneDisplay: '+91 6202028486',
  phoneTel: '+916202028486',
  phoneHyphen: '+91-6202028486',
  github: 'https://github.com/simran043',
  linkedin: 'https://linkedin.com/in/simran-kumar043',
} as const;

export const RESUME_URL = 'https://drive.google.com/file/d/1UL2ZcUrXa-Aov3wPY5kaMmn6UV2RDUma/view?usp=sharing';

export const SECTIONS = [
  { id: 'hero', label: 'Overview' },
  { id: 'experience', label: 'Experience & Edu' },
  { id: 'projects', label: 'Live Demos' },
  { id: 'skills', label: 'Skills Matrix' },
  { id: 'awards', label: 'Honors' },
  { id: 'contact', label: 'Contact' },
] as const;
