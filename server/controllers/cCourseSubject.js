import { CourseSubjectService } from "../services/sCourseSubject.js";

export const CourseSubjectController = {
    async createCourseSubject(req, res) {
        try {
            const result = await CourseSubjectService.createCourseSubject(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            return res.status(201).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } catch (error) {
            console.error('Controller: Error creating course subject(s):', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create course subject(s)',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getClassrooms(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await CourseSubjectService.getClassrooms(page, limit);

            if (!result.success) {
                if (result.code === 'NO_SUBJECTS') {
                    return res.status(404).json({
                        success: false,
                        message: result.message,
                        code: result.code
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: result.message,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } catch (error) {
            console.error('Controller: Error fetching subjects:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch subjects',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getSubjects(req, res) {
        try {
            const result = await CourseSubjectService.getSubjects();

            if (!result.success) {
                if (result.code === 'NO_SUBJECTS') {
                    return res.status(404).json({
                        success: false,
                        error: result.error,
                        code: result.code
                    });
                }

                return res.status(400).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } catch (error) {
            console.error('Controller: Error fetching subjects:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch subjects',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async updateCourseSubject(req, res) {
        try {
            const { courseSubjectId } = req.params;
            
            // Validación de parámetros
            if (!courseSubjectId) {
                return res.status(400).json({
                    success: false,
                    error: 'Course subject ID is required',
                    code: 'MISSING_PARAMETER'
                });
            }

            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Request body cannot be empty',
                    code: 'EMPTY_BODY'
                });
            }

            const result = await CourseSubjectService.updateCourseSubject(courseSubjectId, req.body);

            if (!result.success) {
                let status = 400;
                if (result.code === 'SERVICE_ERROR') status = 500;
                if (result.code === 'NOT_FOUND') status = 404;
                if (result.code === 'DUPLICATE_SUBJECT' || result.code === 'CONSTRAINT_VIOLATION') status = 409;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Error updating course subject:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update course subject',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async deleteCourseSubject(req, res) {
        try {
            const { courseSubjectId } = req.params;

            if (!courseSubjectId || isNaN(parseInt(courseSubjectId))) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid course subject ID is required',
                    code: 'INVALID_PARAMETER'
                });
            }

            const result = await CourseSubjectService.deleteCourseSubject(courseSubjectId);

            if (!result.success) {
                let status = 400;
                if (result.code === 'SERVICE_ERROR') status = 500;
                if (result.code === 'NOT_FOUND') status = 404;
                if (result.code === 'FOREIGN_KEY_CONSTRAINT') status = 409;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Error deleting course subject:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete course subject',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getSubjectsByClassroom(req, res) {
        try {
            const { classroomId } = req.params;

            const result = await CourseSubjectService.getSubjectsByClassroom(classroomId);

            if (!result.success) {
                let status = 400;
                if (result.code === 'SERVICE_ERROR') status = 500;
                if (result.code === 'NOT_FOUND') status = 404;

                return res.status(status).json({
                    success: false,
                    message: result.message || result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Error getting subjects by classroom:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get subjects for classroom',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async searchClassroom(req, res) {
        try {
            const { q } = req.query;
            const { page = 1, limit = 10 } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Search term is required',
                    code: 'MISSING_SEARCH_TERM'
                });
            }

            const result = await CourseSubjectService.searchClassroom(q, page, limit);

            if (!result.success) {
                let status = 400;
                if (result.code === 'SERVICE_ERROR') status = 500;
                if (result.code === 'NO_SUBJECTS') status = 404;

                return res.status(status).json({
                    success: false,
                    message: result.message || result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Error searching classrooms:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to search classrooms',
                code: 'CONTROLLER_ERROR'
            });
        }
    }
};