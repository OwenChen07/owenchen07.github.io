
import React from 'react';
import Layout from '../components/Layout';
import { PROJECTS } from '../constants';
import { ArrowUpRight } from 'lucide-react';

const Projects: React.FC = () => {
  return (
    <Layout>
      <div className="w-full flex flex-col items-center">
        <div className="pt-8 md:pt-12 mb-8 w-full max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 italic border-b border-darkOlive/20 pb-4 text-center">
            Projects
          </h1>
        </div>
        <div className="grid gap-12 max-w-5xl w-full">
        {PROJECTS.map((project, index) => (
          <a 
            key={project.id} 
            href={project.link}
            className="group block border-b border-darkOlive/10 pb-12 hover:border-darkOlive transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs opacity-40 font-mono">0{index + 1}</span>
                  <h3 className="text-3xl md:text-4xl font-semibold group-hover:italic transition-all">
                    {project.title}
                  </h3>
                </div>
                <p className="text-lg opacity-70 max-w-2xl font-light">
                  {project.description}
                </p>
                <div className="flex gap-4">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] tracking-widest uppercase border border-darkOlive/20 px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                View Case Study
                <ArrowUpRight size={18} />
              </div>
            </div>
          </a>
        ))}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
