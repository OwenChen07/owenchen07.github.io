
const About = () => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-computer-modern font-bold mb-12 text-center text-gray-900">
          About
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg font-computer-modern text-gray-700 leading-relaxed">
              I am a Computer Science student with a deep fascination for the mathematical foundations of computing. 
              My work focuses on the intersection of theoretical computer science and practical applications.
            </p>
            
            <p className="text-lg font-computer-modern text-gray-700 leading-relaxed">
              Currently pursuing my degree with a focus on algorithms, machine learning, and software engineering. 
              I believe in writing clean, efficient code that stands the test of time.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-2xl font-computer-modern font-bold mb-6 text-gray-900">Skills</h3>
            <div className="space-y-4">
              {[
                { category: 'Languages', items: 'Python, Java, C++, JavaScript, TypeScript' },
                { category: 'Frameworks', items: 'React, Node.js, Django, Spring Boot' },
                { category: 'Tools', items: 'Git, Docker, Linux, VS Code' },
                { category: 'Concepts', items: 'Data Structures, Algorithms, Machine Learning' }
              ].map((skill, index) => (
                <div 
                  key={skill.category}
                  className="opacity-0 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <h4 className="font-computer-modern font-bold text-gray-900 mb-1">{skill.category}</h4>
                  <p className="font-computer-modern text-gray-600">{skill.items}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
