import type { Job, Application, Profile, Communication, Resume, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined,
};

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    description: 'We are looking for an experienced full stack developer to join our team. You will work on building scalable web applications using React, TypeScript, and Django.',
    tags: ['React', 'TypeScript', 'Django', 'PostgreSQL'],
    salary: '$120,000 - $150,000',
    postedDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    description: 'Join our growing team as a Frontend Engineer. You will be responsible for building beautiful, responsive user interfaces with React and TypeScript.',
    tags: ['React', 'TypeScript', 'TailwindCSS'],
    salary: '$100,000 - $130,000',
    postedDate: '2024-01-10',
  },
  {
    id: '3',
    title: 'Backend Developer',
    company: 'DataSystems Inc',
    location: 'New York, NY',
    description: 'We need a skilled backend developer to work on our API infrastructure and data processing systems.',
    tags: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    salary: '$110,000 - $140,000',
    postedDate: '2024-01-12',
  },
  {
    id: '4',
    title: 'Full Stack Engineer',
    company: 'CloudTech Solutions',
    location: 'Austin, TX',
    description: 'Looking for a full stack engineer to build our next generation cloud platform.',
    tags: ['React', 'Node.js', 'AWS', 'MongoDB'],
    salary: '$115,000 - $145,000',
    postedDate: '2024-01-14',
  },
  {
    id: '5',
    title: 'React Developer',
    company: 'WebDev Agency',
    location: 'Seattle, WA',
    description: 'Join our team of talented developers building cutting-edge web applications for clients.',
    tags: ['React', 'TypeScript', 'GraphQL'],
    salary: '$95,000 - $125,000',
    postedDate: '2024-01-08',
  },
];

export const mockApplications: Application[] = [];

export const mockProfile: Profile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  education: [
    {
      id: '1',
      school: 'University of Alberta',
      degree: 'Bachelor',
      field: 'Computer Science',
      startDate: '2018-09',
      endDate: '2022-05',
      description:"bruh",
    },
  ],
  experience: [
    {
      id: '1',
      company: 'Tech Startup',
      position: 'Junior Developer',
      startDate: '2022-06',
      endDate: '2023-12',
      description: [
        'Developed and maintained React frontend applications',
        'Collaborated with backend team on API integration',
        'Implemented responsive designs using modern CSS frameworks',
      ],
    },
  ],
  projects: [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description: 'Built a full-stack e-commerce platform with React and Django',
      technologies: ['React', 'Django', 'PostgreSQL'],
      url: 'https://github.com/example/ecommerce',
    },
  ],
  techStack: ['React', 'TypeScript', 'Django', 'Python', 'PostgreSQL'],
  frameworks: ['React', 'Django'],
  libraries: ['TypeScript'],
  programmingLanguages: ['Python', 'TypeScript', 'JavaScript'],
  links: [
    { id: '1', label: 'GitHub', url: 'https://github.com/johndoe' },
    { id: '2', label: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
  ],
};

export const mockCommunications: Communication[] = [
  {
    id: '1',
    applicationId: '1',
    date: '2024-01-18',
    type: 'email',
    from: 'recruiter@techcorp.com',
    to: 'john.doe@example.com',
    subject: 'Thank you for your application',
    body: 'We have received your application and will review it shortly. We will get back to you within 2 weeks.',
  },
  {
    id: '2',
    applicationId: '2',
    date: '2024-01-15',
    type: 'email',
    from: 'hiring@startupxyz.com',
    to: 'john.doe@example.com',
    subject: 'Interview Invitation',
    body: 'We would like to invite you for a technical interview. Please let us know your availability.',
  },
];

export const mockResumes: Record<string, Resume> = {};