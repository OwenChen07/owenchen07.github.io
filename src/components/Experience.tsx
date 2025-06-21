
const Experience = () => {
  const experiences = [
    {
      title: 'Software Engineering Intern',
      company: 'Tech Startup Inc.',
      period: 'Summer 2024',
      description: 'Developed full-stack web applications using React and Node.js. Collaborated with senior engineers on code reviews and architectural decisions.'
    },
    {
      title: 'Research Assistant',
      company: 'University CS Department',
      period: '2023 - Present',
      description: 'Assisting with research in machine learning algorithms. Published findings on optimization techniques for neural network training.'
    },
    {
      title: 'Teaching Assistant',
      company: 'Data Structures Course',
      period: '2023 - 2024',
      description: 'Mentored 50+ students in fundamental computer science concepts. Led weekly lab sessions and graded assignments.'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-computer-modern font-bold mb-12 text-center text-gray-900">
          Experience
        </h2>
        
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div
              key={exp.title}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 opacity-0 animate-slide-in"
              style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <h3 className="text-xl font-computer-modern font-bold text-gray-900">
                  {exp.title}
                </h3>
                <span className="font-computer-modern text-gray-500 text-sm">
                  {exp.period}
                </span>
              </div>
              
              <h4 className="font-computer-modern text-lg text-blue-600 mb-3">
                {exp.company}
              </h4>
              
              <p className="font-computer-modern text-gray-700 leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
