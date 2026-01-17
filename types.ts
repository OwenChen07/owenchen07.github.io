import React from 'react';

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export interface Skill {
  name: string;
  // Fix: Added React import to resolve missing namespace 'React' for ReactNode
  icon: React.ReactNode;
  color?: string;
}

export interface GameEntity {
  x: number;
  y: number;
  radius: number;
}

export interface Projectile extends GameEntity {
  vx: number;
  vy: number;
  skillName: string;
  rotation: number;
  rotationSpeed: number;
}

export interface Player extends GameEntity {
  speed: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
  skillsEncountered: string[];
}