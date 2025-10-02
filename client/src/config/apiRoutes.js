export const API_ROUTES = {
    BASE_URL: import.meta.env.VITE_REACT_APP_ENV === 'production'
        ? import.meta.env.VITE_REACT_APP_BACKEND_API_URL_DEPLOY : import.meta.env.VITE_REACT_APP_BACKEND_API_URL,

    TEACHERS: {
        BASE: '/teachers',
        BY_INSTITUTION: (institutionId) => `/teachers/institution/${institutionId}`,
        SEARCH_TEACHER: (institutionId) => `/teachers/${institutionId}`,
        GET_DETAILS: (teacherId) => `/teachers/details/${teacherId}`,
        GET_CLASSROOMS: (institutionId) => `/teachers/classrooms/${institutionId}`,
        ASSIGN_TUTOR_CLASSROOM: '/teachers/assign-tutor',
        DELETE_ASSIGN_TUTOR_CLASSROOM: (classroomTutorId) => `/teachers/assign-tutor/${classroomTutorId}`,
        UPDATE_ASSIGN_TUTOR_CLASSROOM: `/teachers/assign-tutor`,
        GET_COURSE_SUBJECTS: (institutionId) => `/teachers/course-subjects/${institutionId}`,
        ASSIGN_CLASSROOM_SUBJECT: '/teachers/assign/course-subject',
        UPDATE_CLASSROOM_SUBJECT: '/teachers/assign/course-subject',
        DELETE_CLASSROOM_SUBJECT: (assignmentId) => `/teachers/assign/course-subject/${assignmentId}`,
        GET_INFO_BASIC_TEACHER: (teacherId) => `/teachers/info/${teacherId}`,
        SOFT_DELETE_TEACHER: (teacherId) => `/teachers/deactivate/${teacherId}`,
        GET_TEACHERS_DEACTIVATED: (institutionId) => `/teachers/details/${institutionId}?includeInactive=true`,
    },

    SUBJECTS: {
        BASE: '/subjects',
        GET_DETAILS: (subjectId) => `/subjects/details/${subjectId}`,
        SEARCH_SUBJECTS: `/subjects/search`,
        CREATE: '/subjects',
        LIST: '/subjects',
        UPDATE: '/subjects'
    },

    CLASSROOMS: {
        BASE: '/classrooms',
        BY_INSTITUTION: '/classrooms/institution',
        SEARCH_CLASSROOMS: '/classrooms/institution/search',
        CREATE: '/classrooms',
        LIST: '/classrooms',
        UPDATE: '/classrooms',
        GET_DETAILS: (classroomId) => `/classrooms/details/${classroomId}`
    }
}