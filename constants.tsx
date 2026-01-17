
import React from 'react';
import { 
  Code2, 
  Database, 
  Globe, 
  Layers, 
  Cpu, 
  Zap, 
  Server, 
  Smartphone,
  Framer,
  Wind,
  FileCode,
  Terminal,
  Brackets,
  Code,
  FileText,
  GitBranch,
  Wand2
} from 'lucide-react';
import { Project, Skill } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Ethereal Commerce',
    description: 'A headless e-commerce solution built with React and Gemini-driven product descriptions.',
    tags: ['React', 'Gemini API', 'Tailwind'],
    link: '#'
  },
  {
    id: '2',
    title: 'ZenTask',
    description: 'A minimalist productivity application focusing on cognitive load reduction.',
    tags: ['TypeScript', 'Node.js', 'PostgreSQL'],
    link: '#'
  },
  {
    id: '3',
    title: 'FlowState UI',
    description: 'Design system library focused on accessibility and fluid motion.',
    tags: ['Framer Motion', 'React', 'Storybook'],
    link: '#'
  }
];

export const SKILLS: Skill[] = [
  { name: 'Python', icon: <Code2 size={24} /> },
  { name: 'C', icon: <FileCode size={24} /> },
  { name: 'C++', icon: <FileCode size={24} /> },
  { name: 'JS', icon: <Code size={24} /> },
  { name: 'HTML', icon: <FileText size={24} /> },
  { name: 'CSS', icon: <FileText size={24} /> },
  { name: 'SQL', icon: <Database size={24} /> },
  { name: 'PHP', icon: <Server size={24} /> },
  { name: 'React', icon: <Code2 size={24} /> },
  { name: 'Flask', icon: <Layers size={24} /> },
  { name: 'Laravel', icon: <Server size={24} /> },
  { name: 'Tailwind', icon: <Wind size={24} /> },
  { name: 'Git', icon: <GitBranch size={24} /> },
  { name: 'Cursor', icon: <Wand2 size={24} /> },
];

// Logo URLs for canvas rendering (using simple-icons CDN)
// Format: https://cdn.simpleicons.org/{icon-name}/{color-hex}
export const SKILL_LOGOS: { [key: string]: string } = {
  'Python': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFCHi18uXFtRb1_q7pQIVxYlwqvhVzCzZ4PQ&s',
  'C': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/C_Programming_Language.svg/960px-C_Programming_Language.svg.png',
  'C++': 'https://cdn.simpleicons.org/cplusplus/00599C',
  'JS': 'https://cdn.simpleicons.org/javascript/F7DF1E',
  'HTML': 'https://cdn.simpleicons.org/html5/E34F26',
  'CSS': 'https://www.bryan-myers.com/images/4x3/css.png',
  'SQL': 'https://cdn-icons-png.flaticon.com/512/4299/4299956.png',
  'PHP': 'https://cdn.simpleicons.org/php/777BB4',
  'React': 'https://cdn.simpleicons.org/react/61DAFB',
  'Flask': 'https://www.pngfind.com/pngs/m/128-1286693_flask-framework-logo-svg-hd-png-download.png',
  'Laravel': 'https://cdn.simpleicons.org/laravel/FF2D20',
  'Tailwind': 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  'Git': 'https://cdn.simpleicons.org/git/F05032',
  'Cursor': 'https://cdn.simpleicons.org/cursor/000000',
};
