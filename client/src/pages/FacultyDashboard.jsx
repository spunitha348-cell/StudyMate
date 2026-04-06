import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const ALL_OPTION = '__ALL__'

function FacultyDashboard() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState('materials') // materials, students, structure
  
  // Filter states
  const [departments, setDepartments] = useState([])
  const [years, setYears] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [materials, setMaterials] = useState([])
  
  const [selectedDepartment, setSelectedDepartment] = useState(ALL_OPTION)
  const [selectedYear, setSelectedYear] = useState(ALL_OPTION)
  const [selectedSemester, setSelectedSemester] = useState(ALL_OPTION)
  const [selectedSubject, setSelectedSubject] = useState(ALL_OPTION)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Upload states
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadType, setUploadType] = useState('note')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // Student management states
  const [students, setStudents] = useState([])
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const materialsRequestIdRef = useRef(0)

  const resetMaterialFilters = () => {
    setSelectedDepartment(ALL_OPTION)
    setSelectedYear(ALL_OPTION)
    setSelectedSemester(ALL_OPTION)
    setSelectedSubject(ALL_OPTION)
    setSearchTerm('')
    setSemesters([])
    setSubjects([])
  }

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const userRole = localStorage.getItem('userRole')
    const storedUsername = localStorage.getItem('username')

    if (!isAuthenticated || userRole !== 'faculty') {
      navigate('/login/faculty')
    } else {
      setUsername(storedUsername || 'Faculty')
      resetMaterialFilters()
      loadInitialData()
    }
  }, [navigate])

  const loadInitialData = async () => {
    try {
      const [deptsData, yearsData] = await Promise.all([
        api.getDepartments(),
        api.getYears()
      ])
      const depts = Array.isArray(deptsData.results) ? deptsData.results : (Array.isArray(deptsData) ? deptsData : [])
      const yrs = Array.isArray(yearsData.results) ? yearsData.results : (Array.isArray(yearsData) ? yearsData : [])
      setDepartments(depts)
      setYears(yrs)
      // Keep filters as "All" on first load
      resetMaterialFilters()
    } catch (error) {
      console.error('Error loading initial data:', error)
      setDepartments([])
      setYears([])
      if (error.message && error.message.includes('Authentication required')) {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('userRole')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/login/faculty')
      }
    }
  }

  const handleDepartmentChange = (deptId) => {
    setSelectedDepartment(deptId)
    setSelectedSemester(ALL_OPTION)
    setSelectedSubject(ALL_OPTION)
    setSemesters([])
    setSubjects([])
    if (deptId !== ALL_OPTION && selectedYear !== ALL_OPTION) {
      loadSemesters(deptId, selectedYear)
    }
  }

  const handleYearChange = (yearId) => {
    setSelectedYear(yearId)
    setSelectedSemester(ALL_OPTION)
    setSelectedSubject(ALL_OPTION)
    setSemesters([])
    setSubjects([])
    if (yearId !== ALL_OPTION && selectedDepartment !== ALL_OPTION) {
      loadSemesters(selectedDepartment, yearId)
    }
  }

  const loadSemesters = async (deptId, yearId) => {
    try {
      const data = await api.getSemesters({ department: deptId, year: yearId })
      const list = Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : [])
      setSemesters(list)
    } catch (error) {
      console.error('Error loading semesters:', error)
    }
  }

  const handleSemesterChange = (semesterId) => {
    setSelectedSemester(semesterId)
    setSelectedSubject(ALL_OPTION)
    setSubjects([])
    if (semesterId !== ALL_OPTION) {
      loadSubjects(semesterId)
    }
  }

  const loadSubjects = async (semesterId) => {
    try {
      const data = await api.getSubjects({ semester: semesterId })
      const list = Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : [])
      setSubjects(list)
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId)
    if (subjectId !== ALL_OPTION) {
      loadMaterials()
    }
  }

  const loadMaterials = async () => {
    const requestId = ++materialsRequestIdRef.current
    try {
      const filters = {}
      if (selectedDepartment !== ALL_OPTION) filters.department = selectedDepartment
      if (selectedYear !== ALL_OPTION) filters.year = selectedYear
      if (selectedSemester !== ALL_OPTION) filters.semester = selectedSemester
      if (selectedSubject !== ALL_OPTION) filters.subject = selectedSubject
      if (searchTerm) filters.search = searchTerm
      
      const data = await api.getAdminMaterials(filters)
      if (requestId === materialsRequestIdRef.current) {
        setMaterials(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
      }
    } catch (error) {
      console.error('Error loading materials:', error)
      if (requestId === materialsRequestIdRef.current) {
        setMaterials([])
      }
      
      // If authentication error, redirect to login
      if (error.message && error.message.includes('Authentication required')) {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('userRole')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/login/faculty')
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (selectedSubject === ALL_OPTION) {
      alert('Please select a subject')
      return
    }
    if (!uploadFile && !uploadYoutubeUrl.trim()) {
      alert('Please upload a file or add a YouTube link')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('subject', selectedSubject)
      formData.append('title', uploadTitle)
      formData.append('description', uploadDescription)
      formData.append('material_type', uploadType)
      if (uploadFile) {
        formData.append('file', uploadFile)
      }
      if (uploadYoutubeUrl.trim()) {
        formData.append('youtube_url', uploadYoutubeUrl.trim())
      }

      const createdMaterial = await api.uploadMaterial(formData)
      
      // Reset form
      setUploadTitle('')
      setUploadDescription('')
      setUploadFile(null)
      setUploadYoutubeUrl('')
      setShowUploadModal(false)
      
      // Show immediately in UI, then sync from backend.
      if (createdMaterial && createdMaterial.id) {
        setMaterials((prev) => {
          const existing = Array.isArray(prev) ? prev : []
          const withoutSame = existing.filter((item) => String(item.id) !== String(createdMaterial.id))
          return [createdMaterial, ...withoutSame]
        })
      }
      // Reset to "All" filters so newly uploaded material is always visible immediately.
      resetMaterialFilters()
      alert('Material uploaded successfully!')
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const formatUploadTime = (dateValue) => {
    if (!dateValue) return 'N/A'
    return new Date(dateValue).toLocaleString()
  }

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return
    }

    try {
      await api.deleteMaterial(materialId)
      alert('Material deleted successfully!')
      loadMaterials()
    } catch (error) {
      alert('Delete failed: ' + error.message)
    }
  }

  const handleDownloadMaterial = async (materialId) => {
    try {
      await api.downloadAdminMaterial(materialId)
    } catch (error) {
      alert('Download failed: ' + error.message)
    }
  }

  const loadStudents = async () => {
    try {
      const data = await api.getStudents({ search: studentSearchTerm })
      setStudents(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
      
      // If authentication error, redirect to login
      if (error.message && error.message.includes('Authentication required')) {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('userRole')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/login/faculty')
      }
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student? This action cannot be undone and will remove all data associated with this student.')) {
      return
    }

    try {
      await api.deleteStudent(studentId)
      alert('Student deleted permanently!')
      loadStudents()
    } catch (error) {
      alert('Delete failed: ' + error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/')
  }

  useEffect(() => {
    if (selectedDepartment !== ALL_OPTION && selectedYear !== ALL_OPTION) {
      loadSemesters(selectedDepartment, selectedYear)
    }
  }, [selectedDepartment, selectedYear])

  useEffect(() => {
    if (selectedSemester !== ALL_OPTION) {
      loadSubjects(selectedSemester)
    }
  }, [selectedSemester])

  useEffect(() => {
    if (activeTab === 'materials') {
      loadMaterials()
    } else if (activeTab === 'students') {
      loadStudents()
    }
  }, [
    selectedDepartment,
    selectedYear,
    selectedSemester,
    selectedSubject,
    searchTerm,
    activeTab,
    studentSearchTerm
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                StudyMate Faculty
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome, {username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Faculty Dashboard</h2>
          <p className="text-gray-600">Manage your academic resources and students</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'materials', label: 'Study Materials', icon: '📚' },
                { id: 'students', label: 'Manage Students', icon: '👥' },
                // { id: 'structure', label: 'Academic Structure', icon: '🏗️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + Upload Material
                </button>
              </div>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value={ALL_OPTION}>All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value={ALL_OPTION}>All Years</option>
                    {years.map((year) => (
                      <option key={year.id} value={year.id}>{year.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    disabled={selectedDepartment === ALL_OPTION || selectedYear === ALL_OPTION}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
                  >
                    <option value={ALL_OPTION}>All Semesters</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>Semester {sem.number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    disabled={selectedSemester === ALL_OPTION}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100"
                  >
                    <option value={ALL_OPTION}>All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search materials..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Materials List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Study Materials</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((material) => (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{material.title}</h4>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                        {material.material_type}
                      </span>
                    </div>
                    {material.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                    )}
                    {material.youtube_url && (
                      <a
                        href={material.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-red-600 hover:text-red-700 font-medium mb-2 block"
                      >
                        Watch on YouTube
                      </a>
                    )}
                    <div className="text-xs text-gray-500 mb-3">
                      <p>Uploaded by: {material.uploaded_by_name || 'Unknown'}</p>
                      <p>Uploaded at: {formatUploadTime(material.created_at)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">{material.subject_name}</span>
                      <div className="flex gap-2">
                        {material.file_url && (
                          <button
                            onClick={() => handleDownloadMaterial(material.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close upload dialog"
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
              onClick={() => setShowUploadModal(false)}
            />
            <div className="relative z-10 bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Study Material</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value={ALL_OPTION}>Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Enter material title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="note">Note</option>
                    <option value="question_paper">Question Paper</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL (optional)</label>
                  <input
                    type="url"
                    value={uploadYoutubeUrl}
                    onChange={(e) => setUploadYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">File *</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a file or provide YouTube URL.</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
                <div className="flex-1 max-w-md ml-4">
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="Search students by name, email, or username..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Registered Students ({students.length})</h3>
              
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No students found.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Username</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{student.username}</td>
                          <td className="py-3 px-4 text-gray-600">{student.email}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {student.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {/* {activeTab === 'structure' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Structure</h3>
            <p className="text-gray-600">Academic structure management functionality coming soon...</p>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default FacultyDashboard
