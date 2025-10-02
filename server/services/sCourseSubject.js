import { CourseSubjectModel } from "../models/mCourseSubject.js";

export const CourseSubjectService = {
    async createCourseSubject(data) {
        try {
            const subjects = Array.isArray(data) ? data : [data];

            if (subjects.length === 0) {
                return {
                    success: false,
                    error: 'No subjects provided',
                    code: 'MISSING_DATA'
                };
            }

            const requiredFields = ['classroom_id', 'subject_id', 'hours_per_week'];

            for (let i = 0; i < subjects.length; i++) {
                const subject = subjects[i];

                const missingFields = requiredFields.filter(field =>
                    subject[field] === undefined || subject[field] === null ||
                    (typeof subject[field] === 'string' && subject[field].trim() === '')
                );

                if (missingFields.length > 0) {
                    return {
                        success: false,
                        error: `Subject ${i + 1}: Missing required fields: ${missingFields.join(', ')}`,
                        code: 'MISSING_REQUIRED_FIELDS'
                    };
                }

                if (!Number.isInteger(Number(subject.classroom_id)) || Number(subject.classroom_id) <= 0) {
                    return {
                        success: false,
                        error: `Subject ${i + 1}: classroom_id must be a valid positive integer`,
                        code: 'INVALID_CLASSROOM_ID'
                    };
                }

                if (!Number.isInteger(Number(subject.subject_id)) || Number(subject.subject_id) <= 0) {
                    return {
                        success: false,
                        error: `Subject ${i + 1}: subject_id must be a valid positive integer`,
                        code: 'INVALID_SUBJECT_ID'
                    };
                }

                if (!Number.isInteger(Number(subject.hours_per_week)) || Number(subject.hours_per_week) < 0) {
                    return {
                        success: false,
                        error: `Subject ${i + 1}: hours_per_week must be a valid non-negative integer`,
                        code: 'INVALID_HOURS_PER_WEEK'
                    };
                }

                for (let j = i + 1; j < subjects.length; j++) {
                    if (subjects[j].classroom_id === subject.classroom_id &&
                        subjects[j].subject_id === subject.subject_id) {
                        return {
                            success: false,
                            error: `Duplicate subject found: Subject ${subject.subject_id} is repeated for classroom ${subject.classroom_id}`,
                            code: 'DUPLICATE_SUBJECT_IN_REQUEST'
                        };
                    }
                }

                subject.classroom_id = Number(subject.classroom_id);
                subject.subject_id = Number(subject.subject_id);
                subject.hours_per_week = Number(subject.hours_per_week);
            }

            const result = await CourseSubjectModel.create(subjects);

            if (!result.success) {
                if (result.code === 'MODEL_ERROR' && result.error.includes('UNIQUE constraint failed')) {
                    return {
                        success: false,
                        error: 'One or more subjects are already assigned to the classroom',
                        code: 'DUPLICATE_SUBJECT'
                    };
                }

                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            const message = subjects.length === 1
                ? 'Course subject created successfully'
                : `Successfully created ${result.data.total_created} course subjects`;

            return {
                success: true,
                data: result.data,
                message: message
            };

        } catch (error) {
            console.error('Service: Error creating course subject(s):', error);
            return {
                success: false,
                error: 'Failed to create course subject(s)',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getClassrooms(page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await CourseSubjectModel.getClassrooms(pageNum, limitNum);
            if (!result.success) {
                return {
                    success: false,
                    message: result.message,
                    code: result.code
                };
            }

            return {
                success: true,
                data: result.data,
                message: 'Classrooms retrieved successfully'
            };
        } catch (error) {
            console.error('Service: Error fetching classrooms:', error);
            return {
                success: false,
                message: 'Failed to fetch classrooms',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getSubjects() {
        try {
            const result = await CourseSubjectModel.getSubjects();
            if (!result.success) {
                return {
                    success: false,
                    message: result.message,
                    code: result.code
                };
            }

            return {
                success: true,
                data: result.data,
                message: 'Subjects retrieved successfully'
            };
        } catch (error) {
            console.error('Service: Error fetching subjects:', error);
            return {
                success: false,
                message: 'Failed to fetch subjects',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async updateCourseSubject(courseSubjectId, data) {
        try {
            // Validar courseSubjectId
            if (!courseSubjectId) {
                return {
                    success: false,
                    error: 'Course subject ID is required',
                    code: 'MISSING_PARAMETER'
                };
            }

            const numericId = parseInt(courseSubjectId, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return {
                    success: false,
                    error: 'Course subject ID must be a valid positive integer',
                    code: 'INVALID_COURSE_SUBJECT_ID'
                };
            }

            // Preparar datos para actualización (solo campos permitidos)
            const updateData = {};

            // Solo permitir actualización de estos campos específicos
            // classroom_id NO se permite cambiar desde esta función
            if (data.subject_id !== undefined) {
                if (!Number.isInteger(Number(data.subject_id)) || Number(data.subject_id) <= 0) {
                    return {
                        success: false,
                        error: 'subject_id must be a valid positive integer',
                        code: 'INVALID_SUBJECT_ID'
                    };
                }
                updateData.subject_id = Number(data.subject_id);
            }

            if (data.hours_per_week !== undefined) {
                if (!Number.isInteger(Number(data.hours_per_week)) || Number(data.hours_per_week) < 0) {
                    return {
                        success: false,
                        error: 'hours_per_week must be a valid non-negative integer',
                        code: 'INVALID_HOURS_PER_WEEK'
                    };
                }
                updateData.hours_per_week = Number(data.hours_per_week);
            }

            if (data.active !== undefined) {
                if (typeof data.active !== 'boolean' && data.active !== 0 && data.active !== 1) {
                    return {
                        success: false,
                        error: 'active field must be a boolean value (true/false or 1/0)',
                        code: 'INVALID_ACTIVE_VALUE'
                    };
                }
                updateData.active = Boolean(data.active);
            }

            // Validar que hay al menos un campo para actualizar
            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: 'No valid fields to update. Allowed fields: subject_id, hours_per_week, active',
                    code: 'NO_VALID_FIELDS'
                };
            }

            // Llamar al modelo
            const result = await CourseSubjectModel.update(numericId, updateData);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            return {
                success: true,
                data: result.data,
                message: result.data.updated 
                    ? `Course subject updated successfully. ${result.data.updatedFields} field(s) modified.`
                    : 'No changes were needed.'
            };

        } catch (error) {
            console.error('Service: Error updating course subject:', error);
            return {
                success: false,
                error: 'Failed to update course subject',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async deleteCourseSubject(courseSubjectId) {
        try {
            // Validar courseSubjectId
            if (!courseSubjectId) {
                return {
                    success: false,
                    error: 'Course subject ID is required',
                    code: 'MISSING_PARAMETER'
                };
            }

            const numericId = parseInt(courseSubjectId, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return {
                    success: false,
                    error: 'Course subject ID must be a valid positive integer',
                    code: 'INVALID_COURSE_SUBJECT_ID'
                };
            }

            // Llamar al modelo
            const result = await CourseSubjectModel.delete(numericId);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };

        } catch (error) {
            console.error('Service: Error deleting course subject:', error);
            return {
                success: false,
                error: 'Failed to delete course subject',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getSubjectsByClassroom(classroomId) {
        try {
            // Validar classroomId
            if (!classroomId) {
                return {
                    success: false,
                    message: 'Classroom ID is required',
                    code: 'MISSING_PARAMETER'
                };
            }

            const numericId = parseInt(classroomId, 10);
            if (isNaN(numericId) || numericId <= 0) {
                return {
                    success: false,
                    message: 'Classroom ID must be a valid positive integer',
                    code: 'INVALID_CLASSROOM_ID'
                };
            }

            // Llamar al modelo
            const result = await CourseSubjectModel.getSubjectsByClassroom(numericId);

            if (!result.success) {
                return {
                    success: false,
                    message: result.message,
                    code: result.code
                };
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };

        } catch (error) {
            console.error('Service: Error getting subjects by classroom:', error);
            return {
                success: false,
                message: 'Failed to get subjects for classroom',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async searchClassroom(searchTerm, page, limit) {
        try {
            // Validar término de búsqueda
            if (!searchTerm || searchTerm.trim() === '') {
                return {
                    success: false,
                    error: 'Search term is required',
                    code: 'MISSING_SEARCH_TERM'
                };
            }

            // Sanitizar término de búsqueda
            const cleanSearchTerm = searchTerm.trim();
            if (cleanSearchTerm.length < 1) {
                return {
                    success: false,
                    error: 'Search term must be at least 1 character long',
                    code: 'INVALID_SEARCH_TERM'
                };
            }

            // Llamar al modelo
            const result = await CourseSubjectModel.searchClassroom(cleanSearchTerm, page, limit);

            if (!result.success) {
                return {
                    success: false,
                    message: result.message || result.error,
                    code: result.code
                };
            }

            return {
                success: true,
                data: result.data,
                message: result.message
            };

        } catch (error) {
            console.error('Service: Error searching classrooms:', error);
            return {
                success: false,
                error: 'Failed to search classrooms',
                code: 'SERVICE_ERROR'
            };
        }
    },
};