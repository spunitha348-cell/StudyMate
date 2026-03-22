import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Glassmorphism Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                StudyMate
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#structure" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Structure</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">About</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <Link to="/login/student" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100">
                Student login
              </Link>
              <Link to="/login/faculty" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100">
                Faculty login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold shadow-sm">
                🎓 For engineering students
              </span>
            </div>
            <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Centralize Your
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Study Resources
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Built for B.E. / B.Tech learners: one place for notes, question papers, and lab resources—organized by year and semester so you spend less time searching and more time studying.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/signup/student" className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-2xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10">Student sign up</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link to="/signup/faculty" className="group relative bg-white text-indigo-700 border-2 border-indigo-200 hover:border-indigo-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-indigo-200/50 transform hover:-translate-y-1">
                Faculty sign up
              </Link>
            </div>
            
          
            
          </div>
        </div>
      </section>

      {/* Problem Statement - Enhanced Cards */}
      <section id="about" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              The Challenge
            </span>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Struggling with Scattered Resources?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Engineering coursework moves fast—your materials should keep up
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: '📱', 
                title: 'Scattered Resources', 
                desc: 'WhatsApp groups, emails, personal drives - everything is everywhere',
                gradient: 'from-red-500 to-pink-500',
                bg: 'bg-red-50'
              },
              { 
                icon: '📄', 
                title: 'Duplication Chaos', 
                desc: 'Multiple copies of the same materials wasting your storage',
                gradient: 'from-orange-500 to-red-500',
                bg: 'bg-orange-50'
              },
              { 
                icon: '⏰', 
                title: 'Outdated Content', 
                desc: 'No way to know what\'s current and what\'s obsolete',
                gradient: 'from-yellow-500 to-orange-500',
                bg: 'bg-yellow-50'
              },
              { 
                icon: '🔍', 
                title: 'Search Nightmare', 
                desc: 'Finding relevant content takes forever across platforms',
                gradient: 'from-amber-500 to-yellow-500',
                bg: 'bg-amber-50'
              }
            ].map((problem, idx) => (
              <div key={idx} className={`group relative ${problem.bg} rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100`}>
                <div className={`text-5xl mb-4 transform group-hover:scale-110 transition-transform`}>
                  {problem.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{problem.desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${problem.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Premium Design */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              Why StudyMate?
            </span>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need, One Platform
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One platform for engineering students and faculty to share and manage study resources
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Organized Structure',
                desc: 'Follows real-world academic hierarchy: Year → Semester → Subject. Intuitive navigation that matches your mental model.',
                gradient: 'from-blue-500 to-cyan-500',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600'
              },
              {
                icon: '🔐',
                title: 'Secure & Centralized',
                desc: 'All your study materials in one secure platform. Enterprise-grade security with easy access.',
                gradient: 'from-purple-500 to-indigo-500',
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600'
              },
              {
                icon: '👥',
                title: 'Role-Based Access',
                desc: 'Students browse and download; faculty upload and manage materials. Each role sees what they need.',
                gradient: 'from-indigo-500 to-purple-500',
                iconBg: 'bg-indigo-100',
                iconColor: 'text-indigo-600'
              },
              {
                icon: '📱',
                title: 'Responsive Design',
                desc: 'Access your materials from any device - desktop, tablet, or mobile. Study anywhere, anytime.',
                gradient: 'from-pink-500 to-rose-500',
                iconBg: 'bg-pink-100',
                iconColor: 'text-pink-600'
              },
              {
                icon: '🔍',
                title: 'Powerful Search',
                desc: 'Quickly find notes, question papers, and study materials with our intelligent search functionality.',
                gradient: 'from-green-500 to-emerald-500',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600'
              },
              {
                icon: '🚀',
                title: 'Future-Ready',
                desc: 'Built for scalability with plans for AI-powered features like note summarization and intelligent recommendations.',
                gradient: 'from-orange-500 to-amber-500',
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-600'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`${feature.iconBg} ${feature.iconColor} w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hierarchy Section - Enhanced */}
      <section id="structure" className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              Simple Structure
            </span>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Intuitive Academic Organization
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              StudyMate mirrors your real-world academic structure
            </p>
          </div>
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              {[
                { 
                  level: 'Year', 
                  desc: 'Select your academic year', 
                  gradient: 'from-indigo-500 to-blue-500',
                  bg: 'bg-indigo-100',
                  number: '1'
                },
                { 
                  level: 'Semester', 
                  desc: 'Choose your semester', 
                  gradient: 'from-purple-500 to-indigo-500',
                  bg: 'bg-purple-100',
                  number: '2'
                },
                { 
                  level: 'Subject', 
                  desc: 'Access subject materials', 
                  gradient: 'from-pink-500 to-purple-500',
                  bg: 'bg-pink-100',
                  number: '3'
                }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-12 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 transform -translate-y-1/2 z-0">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-purple-300"></div>
                    </div>
                  )}
                  <div className={`relative bg-gradient-to-br ${item.gradient} text-white rounded-2xl w-32 h-32 flex items-center justify-center text-4xl font-bold shadow-2xl transform hover:scale-110 transition-all mb-6 z-10`}>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm"></div>
                    <span className="relative z-10">{item.number}</span>
                  </div>
                  <div className={`${item.bg} rounded-xl px-6 py-4 text-center shadow-lg border-2 border-white`}>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{item.level}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Study Experience?
          </h3>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join engineering students who keep notes, papers, and labs organized with StudyMate
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup/student" className="group bg-white text-indigo-600 hover:bg-gray-50 px-10 py-5 rounded-xl text-lg font-semibold transition-all shadow-2xl hover:shadow-white/50 transform hover:-translate-y-1">
              <span className="flex items-center justify-center space-x-2">
                <span>Student sign up</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link to="/signup/faculty" className="group border-2 border-white/80 text-white hover:bg-white/10 px-10 py-5 rounded-xl text-lg font-semibold transition-all transform hover:-translate-y-1">
              Faculty sign up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h4 className="text-xl font-bold text-white">StudyMate</h4>
              </div>
              <p className="text-sm text-gray-400">
                Your comprehensive academic resource management platform.
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 StudyMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
