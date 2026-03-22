import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom'
import { api } from '../services/api'
import ForgotPasswordForm from '../components/ForgotPasswordForm'

const studentMotivations = [
  {
    title: "Welcome Back!",
    description: "Continue your engineering journey with StudyMate. Notes, papers, and labs in one place.",
    icon: "🎓"
  },
  {
    title: "Built for B.E. / B.Tech",
    description: "Stay on top of semesters, subjects, and coursework with a structure that matches your program.",
    icon: "⚙️"
  },
  {
    title: "Organized Learning",
    description: "Find materials by year and semester—no more lost PDFs in random chat groups.",
    icon: "📚"
  },
  {
    title: "Study Smart",
    description: "Access quality resources anytime. Your companion for engineering academics.",
    icon: "💡"
  },
  {
    title: "Stay Ahead",
    description: "Keep up with syllabus-aligned materials and focus on what matters for your exams.",
    icon: "⭐"
  }
]

const facultyMotivations = [
  {
    title: "Faculty Portal",
    description: "Upload materials, manage structure, and support engineering students from one dashboard.",
    icon: "👩‍🏫"
  },
  {
    title: "Secure faculty access",
    description: "Your sign-in is verified against the faculty database before you reach the dashboard.",
    icon: "🔐"
  },
  {
    title: "Curate resources",
    description: "Keep notes, papers, and labs organized by year and semester for your students.",
    icon: "📂"
  },
  {
    title: "Stay in sync",
    description: "Same platform as students—aligned content, less friction.",
    icon: "🔗"
  },
  {
    title: "Lead with clarity",
    description: "Focus on teaching; we help keep the catalog structured.",
    icon: "✨"
  }
]

function Login() {
  const navigate = useNavigate()
  const { mode } = useParams()
  const isFaculty = mode === 'faculty'
  const isStudent = mode === 'student'
  const loginMotivations = isFaculty ? facultyMotivations : studentMotivations

  const [searchParams, setSearchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentMotivation, setCurrentMotivation] = useState(0)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    if (!isFaculty && !isStudent) {
      navigate('/login/student', { replace: true })
    }
  }, [isFaculty, isStudent, navigate])

  useEffect(() => {
    if (searchParams.get('forgot') === '1') {
      setShowForgotPassword(true)
    }
  }, [searchParams])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMotivation((prev) => (prev + 1) % loginMotivations.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [loginMotivations.length])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      if (isFaculty) {
        response = await api.loginFaculty(formData.email, formData.password)
      } else {
        response = await api.loginStudent(null, formData.email, formData.password)
      }

      localStorage.setItem('accessToken', response.access)
      localStorage.setItem('refreshToken', response.refresh)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', response.role || (isFaculty ? 'faculty' : 'student'))
      localStorage.setItem('username', response.username || (isFaculty ? 'Faculty' : 'Student'))

      if (response.role === 'faculty' || isFaculty) {
        navigate('/faculty/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  const openForgot = () => {
    setShowForgotPassword(true)
    setSearchParams({ forgot: '1' })
  }

  const closeForgot = () => {
    setShowForgotPassword(false)
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                StudyMate
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="/#structure" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Structure</a>
              <a href="/#about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">About</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <Link
                to="/login/student"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isStudent && !showForgotPassword
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
                }`}
              >
                Student login
              </Link>
              <Link
                to="/login/faculty"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isFaculty && !showForgotPassword
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
                }`}
              >
                Faculty login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-40 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 w-full max-w-lg -mt-20">
            {loginMotivations.map((motivation, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentMotivation ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="text-center text-white">
                  <div className="text-8xl mb-6 animate-bounce">
                    {motivation.icon}
                  </div>
                  <h3 className="text-4xl font-bold mb-4">
                    {motivation.title}
                  </h3>
                  <p className="text-xl text-white/90 leading-relaxed">
                    {motivation.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {loginMotivations.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentMotivation
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {showForgotPassword ? 'Reset password' : isFaculty ? 'Faculty sign in' : 'Student sign in'}
              </h2>
              <p className="text-gray-600">
                {showForgotPassword
                  ? 'Students and faculty can recover access with their registered email.'
                  : isFaculty
                    ? 'Sign in with your faculty email and password.'
                    : 'Use your student account email and password.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              {showForgotPassword ? (
                <ForgotPasswordForm
                  onBackToSignIn={() => {
                    closeForgot()
                  }}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {loading ? 'Signing in...' : isFaculty ? 'Faculty sign in' : 'Student sign in'}
                  </button>
                </form>
              )}

              {!showForgotPassword && (
                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    New here?{' '}
                    <Link
                      to={isFaculty ? '/signup/faculty' : '/signup/student'}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {isFaculty ? 'Faculty sign up' : 'Student sign up'}
                    </Link>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                    <Link
                      to={isFaculty ? '/login/student' : '/login/faculty'}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {isFaculty ? 'Go to student login' : 'Go to faculty login'}
                    </Link>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    ← Back to Home
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
