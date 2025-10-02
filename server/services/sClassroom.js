import { ClassroomModel } from "../models/mClassroom.js";

export const ClassroomService = {
    async createClassroom(data) {
        try {
            const requiredFields = [
                'grade_id', 'parallel_id',
                'capacity', 'classroom_code', 'location', 'schedule'
            ];

            const missingFields = requiredFields.filter(field =>
                !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
            );

            if (missingFields.length > 0) {
                return {
                    success: false,
                    message: `Missing required teacher fields: ${missingFields.join(', ')}`,
                    code: 'MISSING_REQUIRED_FIELDS'
                };
            }

            if (data.capacity > 50) {
                return {
                    success: false,
                    message: 'Classroom capacity cannot exceed 50',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await ClassroomModel.create(data);
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
                message: 'Classroom created successfully'
            };
        } catch (error) {
            console.error('Service: Error creating classroom:', error);
            return {
                success: false,
                message: 'Failed to create classroom',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getAll(page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await ClassroomModel.getAll(pageNum, limitNum);
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

    async getGrades() {
        try {
            const result = await ClassroomModel.getGrades();
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
                message: 'Grades retrieved successfully'
            };
        } catch (error) {
            console.error('Service: Error fetching grades:', error);
            return {
                success: false,
                error: 'Failed to fetch grades',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getParallels() {
        try {
            const result = await ClassroomModel.getParallels();
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
                message: 'Parallels retrieved successfully'
            };
        } catch (error) {
            console.error('Service: Error fetching parallels:', error);
            return {
                success: false,
                error: 'Failed to fetch parallels',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getDetailsById(classroomId) {
        try {
            if (!classroomId || isNaN(classroomId) || classroomId <= 0) {
                return {
                    success: false,
                    error: 'Invalid classroom ID',
                    code: 'INVALID_CLASSROOM_ID'
                };
            }

            const result = await ClassroomModel.getDetailsById(classroomId);
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
            console.error('Service: Error fetching classroom details:', error);
            return {
                success: false,
                error: 'Failed to fetch classroom details',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async searchClassroom(searchTerm, page = 1, limit = 10) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
                return {
                    success: false,
                    error: 'Search term is required',
                    code: 'MISSING_SEARCH_TERM'
                };
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await ClassroomModel.searchClassroom(searchTerm.trim(), pageNum, limitNum);
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
                message: `Found ${result.data.length} classrooms matching the search criteria`

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

    async updateClassroom(classroomId, data) {
        try {
            if (!classroomId || isNaN(classroomId) || classroomId <= 0) {
                return {
                    success: false,
                    error: 'Invalid classroom ID',
                    code: 'INVALID_CLASSROOM_ID'
                };
            }

            if(data.capacity && (isNaN(data.capacity) || data.capacity <= 0 || data.capacity > 50)) {
                return {
                    success: false,
                    error: 'Classroom capacity must be a number between 1 and 50',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await ClassroomModel.update(classroomId, data);
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
            console.error('Service: Error updating classroom:', error);
            return {
                success: false,
                error: 'Failed to update classroom',
                code: 'SERVICE_ERROR'
            };
        }
    }
};