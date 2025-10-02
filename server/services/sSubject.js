import { SubjectModel } from "../models/mSubject.js";

export const SubjectService = {
    async createSubject(data) {
        try {
            const requiredFields = ['name', 'code', 'description'];
            const missingFields = requiredFields.filter(field =>
                !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
            );

            if (missingFields.length > 0) {
                return {
                    success: false,
                    error: `Missing required teacher fields: ${missingFields.join(', ')}`,
                    code: 'MISSING_REQUIRED_FIELDS'
                };
            }

            if (data.code.length < 3) {
                return {
                    success: false,
                    error: 'Code must be at least 3 characters long',
                    code: 'INVALID_FIELD'
                };
            }

            const result = await SubjectModel.create(data);
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
                message: 'Subject created successfully'
            };
        } catch (error) {
            console.error('Service: Unexpected error creating subject:', error);
            return {
                success: false,
                error: 'Failed to create subject',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getAll(page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await SubjectModel.getAll(pageNum, limitNum);
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
                message: `Found ${result.data.pagination.totalItems} subjects (page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages})`
            };
        } catch (error) {
            console.error('Service: Unexpected error fetching subjects:', error);
            return {
                success: false,
                message: 'Failed to fetch subjects',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getDetailsById(subjectId) {
        try {
            if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
                return {
                    success: false,
                    error: 'Invalid subject ID',
                    code: 'INVALID_SUBJECT_ID'
                };
            }

            const result = await SubjectModel.getDetailsById(subjectId);
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
                message: 'Subject details retrieved successfully'
            };
        } catch (error) {
            console.error('Service: Unexpected error fetching subject details:', error);
            return {
                success: false,
                error: 'Failed to fetch subject details',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async searchSubject(searchTerm, page = 1, limit = 10) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
                return {
                    success: false,
                    error: 'Search term is required',
                    code: 'VALIDATION_ERROR'
                };
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await SubjectModel.searchSubject(searchTerm.trim(), pageNum, limitNum);

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
                message: `Found ${result.data.length} subjects matching the search criteria`
            };
        } catch (error) {
            console.error('Service: Unexpected error searching subjects:', error);
            return {
                success: false,
                error: 'Failed to search subjects',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async updateSubject(data) {
        try {
            const { subject_id, name, code, description, active } = data;
            if (!subject_id || isNaN(subject_id) || subject_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid subject ID',
                    code: 'INVALID_SUBJECT_ID'
                };
            }

            const updateData = {};

            if (name !== undefined) {
                if (name && (typeof name !== 'string' || name.trim().length === 0)) {
                    return {
                        success: false,
                        error: 'Name must be a non-empty string',
                        code: 'INVALID_FIELD'
                    };
                }
                updateData.name = name ? name.trim() : name;
            }

            if (code !== undefined) {
                if (code && (typeof code !== 'string' || code.trim().length < 3)) {
                    return {
                        success: false,
                        error: 'Code must be at least 3 characters long',
                        code: 'INVALID_FIELD'
                    };
                }
                updateData.code = code ? code.trim() : code;
            }

            if (description !== undefined) {
                if (description && (typeof description !== 'string' || description.trim().length === 0)) {
                    return {
                        success: false,
                        error: 'Description must be a non-empty string',
                        code: 'INVALID_FIELD'
                    };
                }
                updateData.description = description ? description.trim() : description;
            }

            if (active !== undefined) {
                if (typeof active !== 'boolean' && active !== 0 && active !== 1) {
                    return {
                        success: false,
                        error: 'Active field must be a boolean value',
                        code: 'VALIDATION_ERROR'
                    };
                }
                updateData.active = active;
            }

            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: 'No fields to update. Please provide at least one field to update.',
                    code: 'NO_FIELDS_TO_UPDATE'
                };
            }

            const result = await SubjectModel.updateSubject(subject_id, updateData);

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
            console.error('Service: Unexpected error updating subject:', error);
            return {
                success: false,
                error: 'Failed to update subject',
                code: 'SERVICE_ERROR'
            };
        }
    }
};