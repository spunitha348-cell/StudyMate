export const STATIC_DEPARTMENTS = [
  { id: 'CSE', name: 'CSE', code: 'CSE' },
  { id: 'ECE', name: 'ECE', code: 'ECE' },
  { id: 'EEE', name: 'EEE', code: 'EEE' },
  { id: 'IT', name: 'IT', code: 'IT' },
]

export const STATIC_YEARS = [
  { id: 'Year 1', name: 'Year 1', number: 1 },
  { id: 'Year 2', name: 'Year 2', number: 2 },
  { id: 'Year 3', name: 'Year 3', number: 3 },
  { id: 'Year 4', name: 'Year 4', number: 4 },
]

const buildSemesterId = (department, year, number) => `${department}::${year}::${number}`

export const getStaticSemesters = (department, year) => {
  if (!department || !year) return []
  return Array.from({ length: 8 }, (_, idx) => {
    const number = idx + 1
    return {
      id: buildSemesterId(department, year, number),
      department,
      department_name: department,
      year,
      year_name: year,
      number,
      name: `Semester ${number}`,
    }
  })
}

const STATIC_SUBJECTS_MAP = {
  'CSE::Year 1::1': [
    'Applied Calculus',
    'English Essentials - I',
    'Heritage of Tamils',
    'Applied Physics - I',
    'Applied Chemistry - I',
    'Computer Programming: C',
    'Essentials of Computing',
    'Makerspace',
    'Life Skills for Engineers - I',
    'Physical Education - I',
  ],
  'CSE::Year 1::2': [
    'Linear Algebra',
    'Basic Electrical and Electronics Engineering',
    'Digital Principles and Computer Organization',
    'Tamils and Technology',
    'Applied Physics (CSIE) - II',
    'Object Oriented Programming',
    'English Essentials - II',
    'Re-Engineering for Innovation',
    'Life Skills for Engineers - II',
    'Physical Education - II',
  ],
  'EEE::Year 1::1': [
    'Applied Calculus',
    'Fundamentals of Electrical and Electronics Engineering',
    'Heritage of Tamils',
    'English Essentials - I',
    'Applied Physics - I',
    'Applied Chemistry - I',
    'Computer Programming: C',
    'Makerspace',
    'Life Skills for Engineers - I',
    'Physical Education - I',
  ],
  'EEE::Year 1::2': [
    'Transforms and its Applications',
    'Tamils and Technology',
    'Basic Civil and Mechanical Engineering',
    'Applied Physics (EE) - II',
    'Engineering Drawing',
    'English Essentials - II',
    'Data Structures and Algorithms',
    'Re-Engineering for Innovation',
    'Life Skills for Engineers - II',
    'Physical Education - II',
  ],
  'ECE::Year 1::1': [
    'Applied Calculus',
    'English Essentials - I',
    'Heritage of Tamils',
    'Introduction to Electronics Engineering',
    'Applied Physics - I',
    'Applied Chemistry - I',
    'Computer Programming',
    'Makerspace',
  ],
  'ECE::Year 1::2': [
    'Transforms and its Applications',
    'Tamils and Technology',
    'Applied Physics (ECE) - II',
    'English Essentials - II',
    'Electron Devices',
    'Data Structures and OOPS with Python',
    'Circuits and Network Analysis',
    'Reverse Engineering',
  ],
  'IT::Year 1::1': [
    'Applied Calculus',
    'English Essentials - I',
    'Heritage of Tamils',
    'Applied Physics - I',
    'Applied Chemistry - I',
    'Computer Programming: C',
    'Essentials of Computing',
    'Makerspace',
    'Life Skills for Engineers - I',
    'Physical Education - I',
  ],
  'IT::Year 1::2': [
    'Linear Algebra',
    'Tamils and Technology',
    'Basic Electrical and Electronics Engineering',
    'Applied Physics (CSIE) - II',
    'Foundations of Data Science using Python',
    'Digital Principles and System Design',
    'English Essentials - II',
    'Re-Engineering for Innovation',
    'Life Skills for Engineers - II',
    'Physical Education - II',
  ],
}

export const getStaticSubjects = (semesterId) => {
  const names = STATIC_SUBJECTS_MAP[semesterId] || []
  return names.map((name) => ({
    id: `static::${semesterId}::${name}`,
    name,
    code: '',
    semester: semesterId,
  }))
}

export const getDepartmentOptions = (apiDepartments) => {
  if (Array.isArray(apiDepartments) && apiDepartments.length > 0) {
    return apiDepartments
  }
  return STATIC_DEPARTMENTS
}

export const getYearOptions = (apiYears) => {
  if (Array.isArray(apiYears) && apiYears.length > 0) {
    return apiYears
  }
  return STATIC_YEARS
}

export const getSemesterOptions = (apiSemesters, departmentId, yearId) => {
  if (Array.isArray(apiSemesters) && apiSemesters.length > 0) {
    return apiSemesters
  }
  return getStaticSemesters(departmentId, yearId)
}

export const getSubjectOptions = (apiSubjects, semesterId) => {
  if (Array.isArray(apiSubjects) && apiSubjects.length > 0) {
    return apiSubjects
  }
  return getStaticSubjects(semesterId)
}
