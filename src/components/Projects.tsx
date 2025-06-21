
import { ExternalLink, Github } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'Sorting Algorithm Visualizer',
      description: 'Interactive visualization of classic sorting algorithms including quicksort, mergesort, and heapsort. Built with React and custom animations.',
      tech: ['React', 'TypeScript', 'CSS Animations'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Chess Engine',
      description: 'A chess engine implementing minimax algorithm with alpha-beta pruning. Features position evaluation and opening book integration.',
      tech: ['Java', 'Algorithms', 'Game Theory'],
      github: '#',
      demo: '#'
    },
    {
      title: 'Machine Learning Library',
      description: 'A from-scratch implementation of common ML algorithms including linear regression, neural networks, and decision trees.',
      tech: ['Python', 'NumPy', 'Mathematics'],
      github: '#',
      demo: '#'
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-computer-modern font-bold mb-12 text-center text-gray-900">
          Projects
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
            >
              <h3 className="text-xl font-computer-modern font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {project.title}
              </h3>
              
              <p className="font-computer-modern text-gray-600 mb-4 leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-computer-modern rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex space-x-4">
                <a
                  href={project.github}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
                >
                  <Github className="w-5 h-5 mr-2" />
                  <span className="font-computer-modern">Code</span>
                </a>
                <a
                  href={project.demo}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  <span className="font-computer-modern">Demo</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
