import { turso } from '../database/client.js';

export const SubjectModel = {
    async create(data) {
        try {
            const insertQuery = `
                INSERT INTO subjects (
                    name, code, description
                ) VALUES (?, ?, ?);
            `;

            const result = await turso.execute({
                sql: insertQuery,
                args: [data.name, data.code, data.description]
            });

            if (result.rowsAffected === 0) {
                throw new Error('No rows were inserted');
            }

            const subjectId = Number(result.lastInsertRowid);
            return {
                success: true,
                data: { id: subjectId }
            };
        } catch (error) {
            console.error('Model: Unexpected error creating subject:', error);

            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('subjects.code')) {
                    return {
                        success: false,
                        error: 'A subject with this code already exists',
                        code: 'CODE_ALREADY_EXISTS'
                    };
                }
            }

            return {
                success: false,
                error: 'Unexpected server error',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getAll(page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM subjects
                WHERE active = true;
            `;

            const dataQuery = `
                SELECT id, name, code
                FROM subjects
                WHERE active = true
                ORDER BY name
                LIMIT ? OFFSET ?;
            `;

            const [countResult, dataResult] = await Promise.all([
                turso.execute({ sql: countQuery }),
                turso.execute({ sql: dataQuery, args: [limitNum, offset] })
            ]);

            const total = countResult.rows[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);

            if (dataResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'No subjects found',
                    code: 'NO_SUBJECTS'
                }
            }

            return {
                success: true,
                data: {
                    subjects: dataResult.rows,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: totalPages,
                        totalItems: total,
                        itemsPerPage: limitNum,
                        hasNextPage: pageNum < totalPages,
                        hasPreviousPage: pageNum > 1
                    }
                }
            }
        } catch (error) {
            console.error('Model: Unexpected error fetching subjects:', error);
            return {
                success: false,
                message: 'Unexpected server error',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getDetailsById(subjectID) {
        try {
            const query = `
                SELECT id, name, code, description, active
                FROM subjects
                WHERE id = ? AND active = true;
            `;

            const result = await turso.execute({
                sql: query,
                args: [subjectID]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Subject not found',
                    code: 'SUBJECT_NOT_FOUND'
                };
            }

            return {
                success: true,
                data: result.rows[0]
            };
        } catch (error) {
            console.error('Model: Unexpected error fetching subject details:', error);
            return {
                success: false,
                error: 'Unexpected server error',
                code: 'MODEL_ERROR'
            };
        }
    },

    async searchSubject(searchTerm, page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const selectQuery = `
                SELECT id, name, code 
                FROM subjects
                WHERE active = true 
                AND (name LIKE ? OR code LIKE ?)
                ORDER BY name
                LIMIT ? OFFSET ?;
            `;

            const searchPattern = `%${searchTerm}%`;

            const result = await turso.execute({
                sql: selectQuery,
                args: [searchPattern, searchPattern, limitNum, offset]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'No subjects found matching the search criteria',
                    code: 'NOT_FOUND'
                };
            }

            return {
                success: true,
                data: result.rows,
                message: `Found ${result.rows.length} subjects matching the search criteria`
            };
        } catch (error) {
            console.error('Service: Unexpected error searching subjects:', error);
            return {
                success: false,
                error: 'Failed to search subjects',
                code: 'SERVICE_ERROR'
            }
        }
    },

    async updateSubject(subjectId, data) {
        try {
            const checkQuery = `
                SELECT id, name, code, description, active
                FROM subjects
                WHERE id = ?;
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [subjectId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Subject not found',
                    code: 'NOT_FOUND'
                };
            }

            const currentData = checkResult.rows[0];

            const fieldsToUpdate = [];
            const values = [];

            if (data.name && data.name !== currentData.name) {
                fieldsToUpdate.push('name = ?');
                values.push(data.name);
            }

            if (data.code && data.code !== currentData.code) {
                fieldsToUpdate.push('code = ?');
                values.push(data.code);
            }

            if (data.description && data.description !== currentData.description) {
                fieldsToUpdate.push('description = ?');
                values.push(data.description);
            }

            if (data.active !== undefined && data.active !== currentData.active) {
                fieldsToUpdate.push('active = ?');
                values.push(data.active);
            }

            if (fieldsToUpdate.length === 0) {
                return {
                    success: true,
                    data: {
                        id: subjectId,
                        message: 'No changes detected',
                        update: false,
                        currentData: currentData
                    }
                };
            }

            if (data.name !== undefined || data.code !== undefined) {
                const duplicateQuery = `
                    SELECT id, name, code
                    FROM subjects
                    WHERE (name = ? OR code = ?) AND id != ?;
                `;

                const duplicateResult = await turso.execute({
                    sql: duplicateQuery,
                    args: [
                        data.name || currentData.name,
                        data.code || currentData.code, subjectId
                    ]
                });

                if (duplicateResult.rows.length > 0) {
                    const duplicateRow = duplicateResult.rows[0];
                    let errorMsg = 'A subject with the same ';

                    if (duplicateRow.name === (data.name || currentData.name) &&
                        duplicateRow.code === (data.code || currentData.code)) {
                        errorMsg += 'name and code already exists';
                    } else if (duplicateRow.name === (data.name || currentData.name)) {
                        errorMsg += 'name already exists';
                    } else if (duplicateRow.code === (data.code || currentData.code)) {
                        errorMsg += 'code already exists';
                    }

                    return {
                        success: false,
                        error: errorMsg,
                        code: 'DUPLICATE_SUBJECT'
                    };
                }
            }

            values.push(subjectId);

            const updateQuery = `
                UPDATE subjects
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?;
            `;

            const updateResult = await turso.execute({
                sql: updateQuery,
                args: values
            });

            if (updateResult.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'No rows were updated',
                    code: 'UPDATE_FAILED'
                };
            }

            return {
                success: true,
                data: {
                    id: subjectId,
                    message: 'Subject updated successfully',
                    update: true
                }
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