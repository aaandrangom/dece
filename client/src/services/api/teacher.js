import apiClient from '../../config/apiClient'
import { API_ROUTES } from '../../config/apiRoutes'
import HandleApiError from '../../helpers/errorHandler'

export const TeacherService = {
    async createTeacher(teacherData, institutionId) {
        try {
            const response = await apiClient.post(
                API_ROUTES.TEACHERS.BASE,
                { institution_id: institutionId, ...teacherData }
            )
            return response.data;
        } catch (error) {
            HandleApiError(error, 'createTeacher')
        }
    },

    async getTeachersByInstitution(options = {}, institutionId) {
        try {
            const params = {
                ...options
            };

            const response = await apiClient.get(
                API_ROUTES.TEACHERS.BY_INSTITUTION(institutionId),
                { params }
            );

            return response.data;
        } catch (error) {

            if (error.response?.status === 404 ||
                error.response?.data?.code === 'NOT_FOUND') {
                return {
                    success: true,
                    data: [],
                    total: 0,
                    message: error.response?.data?.error || 'No teachers found'
                };
            }

            HandleApiError(error, 'getTeachersByInstitution')
        }
    },

    async searchTeacher(options = {}, institutionId) {
        try {
            const params = {
                ...options
            };

            const response = await apiClient.get(
                API_ROUTES.TEACHERS.SEARCH_TEACHER(institutionId),
                { params }
            )

            return response.data;
        } catch (error) {
            if (error.response?.status === 404 ||
                error.response?.data?.code === 'NOT_FOUND') {
                return {
                    success: true,
                    data: [],
                    total: 0,
                    message: error.response?.data?.error || 'No teachers found'
                };
            }

            HandleApiError(error, 'searchTeacher')
        }
    },

    async getDetails(teacherId) {
        try {
            const response = await apiClient.get(
                API_ROUTES.TEACHERS.GET_DETAILS(teacherId)
            );

            return response.data;
        } catch (error) {
            HandleApiError(error, 'getDetails')
        }
    },

    async getClassrooms(institutionId) {
        try {
            const response = await apiClient.get(
                API_ROUTES.TEACHERS.GET_CLASSROOMS(institutionId)
            );

            return response.data;
        } catch (error) {
            HandleApiError(error, 'getClassrooms')
        }
    },

    async assignTutorToClassroom(data) {
        try {
            const response = await apiClient.post(
                API_ROUTES.TEACHERS.ASSIGN_TUTOR_CLASSROOM,
                data
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async deleteAssignmentTutor(classroomTutorId) {
        try {
            const response = await apiClient.delete(
                API_ROUTES.TEACHERS.DELETE_ASSIGN_TUTOR_CLASSROOM(classroomTutorId)
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateAssignmentTutor(data) {
        try {
            const response = await apiClient.put(
                API_ROUTES.TEACHERS.UPDATE_ASSIGN_TUTOR_CLASSROOM,
                data
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async assignClassroomSubject(data) {
        try {
            const response = await apiClient.post(
                API_ROUTES.TEACHERS.ASSIGN_CLASSROOM_SUBJECT,
                data
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async getCourseSubjects(institutionId) {
        try {
            const response = await apiClient.get(
                API_ROUTES.TEACHERS.GET_COURSE_SUBJECTS(institutionId)
            );      
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    async updateClassroomSubject(data) {
        try {
            const response = await apiClient.put(
                API_ROUTES.TEACHERS.UPDATE_CLASSROOM_SUBJECT,
                data
            );  
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    async deleteClassroomSubject(assignmentId) {
        try {
            const response = await apiClient.delete(
                API_ROUTES.TEACHERS.DELETE_CLASSROOM_SUBJECT(assignmentId)
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateTeacher(teacherData) {
        try {
            const response = await apiClient.put(
                `${API_ROUTES.TEACHERS.BASE}/`,
                teacherData
            );
            return response.data;
        } catch (error) {
            HandleApiError(error, 'updateTeacher')
        }   
    },

    async getBasicInfo(teacherId) {
        try {
            const response = await apiClient.get(
                API_ROUTES.TEACHERS.GET_INFO_BASIC_TEACHER(teacherId)
            );      
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    async softDeleteTeacher(teacherId) {
        try {
            const response = await apiClient.patch(
                API_ROUTES.TEACHERS.SOFT_DELETE_TEACHER(teacherId)
            );      
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    async getDeactivatedTeachers(institutionId) {
        try {
            const response = await apiClient.get(
                API_ROUTES.TEACHERS.GET_TEACHERS_DEACTIVATED(institutionId)
            );
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    async validateExcelFile(file, institutionId) {
        try {
            const formData = new FormData();
            formData.append('excel', file);

            const response = await apiClient.post(
                `teachers/excel/validate/${institutionId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    async importValidatedTeachers(validTeachers, institutionId) {
        try {
            const response = await apiClient.post(
                `teachers/excel/import/${institutionId}`,
                { validTeachers }
            );
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
}