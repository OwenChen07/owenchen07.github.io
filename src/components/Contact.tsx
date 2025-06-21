
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-computer-modern font-bold mb-12 text-gray-900">
          Contact
        </h2>
        
        <p className="text-lg font-computer-modern text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          I'm always interested in discussing computer science, technology, and potential opportunities. 
          Feel free to reach out if you'd like to connect.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: Mail, label: 'Email', value: 'john.doe@email.com' },
            { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
            { icon: MapPin, label: 'Location', value: 'University City, State' }
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'forwards' }}
            >
              <item.icon className="w-8 h-8 text-gray-600 mb-4" />
              <h3 className="font-computer-modern font-bold text-gray-900 mb-2">
                {item.label}
              </h3>
              <p className="font-computer-modern text-gray-600">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        
        <div className="animate-float">
          <a
            href="mailto:john.doe@email.com"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-computer-modern hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
