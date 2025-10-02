import { turso } from '../database/client.js';

export const CourseSubjectModel = {
    async create(data) {
        const client = await turso.transaction();
        try {
            const subjects = Array.isArray(data) ? data : [data];

            const results = [];
            const insertQuery = `
                INSERT INTO course_subjects (
                    classroom_id, subject_id, hours_per_week
                ) VALUES (?, ?, ?);
            `;

            for (const subject of subjects) {
                const result = await client.execute({
                    sql: insertQuery,
                    args: [
                        subject.classroom_id,
                        subject.subject_id,
                        subject.hours_per_week || 0
                    ]
                });

                if (result.rowsAffected === 0) {
                    throw new Error(`Failed to insert subject`);
                }

                const courseSubjectId = Number(result.lastInsertRowid);

                const detailQuery = `
                    SELECT 
                        cs.id,
                        cs.classroom_id,
                        cs.subject_id,
                        cs.hours_per_week,
                        s.name as subject_name,
                        s.code as subject_code,
                        CONCAT(g.name_short, ' "', p.name, '"') as classroom_name
                    FROM course_subjects cs
                    INNER JOIN subjects s ON cs.subject_id = s.id
                    INNER JOIN classrooms c ON cs.classroom_id = c.id
                    INNER JOIN grades g ON c.grade_id = g.id
                    INNER JOIN parallels p ON c.parallel_id = p.id
                    WHERE cs.id = ?
                `;

                const detailResult = await client.execute({
                    sql: detailQuery,
                    args: [courseSubjectId]
                });

                results.push({
                    id: courseSubjectId,
                    ...detailResult.rows[0],
                    created: true
                });
            }

            await client.commit();

            return {
                success: true,
                data: {
                    created_subjects: results,
                    total_created: results.length,
                    classroom_id: subjects[0].classroom_id
                },
                message: `Successfully created ${results.length} course subject(s)`
            };

        } catch (error) {
            console.error('Model: Error creating course subject(s):', error);
            await client.rollback();
            return {
                success: false,
                error: error.message,
                code: 'MODEL_ERROR'
            };
        }
    },

    async getClassrooms(page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM classrooms
                WHERE active = true;
            `;

            const dataQuery = `
                SELECT
                    c.id AS classroom_id,
                    c.classroom_code,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name, 
                    c.schedule
                FROM classrooms c
                    INNER JOIN grades g ON c.grade_id = g.id
                    INNER JOIN parallels p ON c.parallel_id = p.id
                WHERE c.active = 1
                    AND c.institution_id = (SELECT id FROM institutions WHERE active = 1 LIMIT 1)
                    AND c.academic_year_id = (
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                    )
                ORDER BY g.order_number, p.name
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
                    classrooms: dataResult.rows,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: totalPages,
                        totalItems: total,
                        itemsPerPage: limitNum,
                        hasNextPage: pageNum < totalPages,
                        hasPreviousPage: pageNum > 1
                    }
                }
            };
        } catch (error) {
            console.error('Model: Error fetching classrooms:', error);
            return {
                success: false,
                message: 'Failed to fetch classrooms',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getSubjects() {
        try {
            const dataQuery = `
                SELECT id, name
                FROM subjects
                WHERE active = 1
                ORDER BY name
            `;

            const dataResult = await turso.execute(dataQuery);

            if (dataResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'No subjects found',
                    code: 'NO_SUBJECTS'
                }
            }

            return {
                success: true,
                data: dataResult.rows,
                message: 'Subjects retrieved successfully'
            };
        } catch (error) {
            console.error('Model: Error fetching subjects:', error);
            return {
                success: false,
                message: 'Failed to fetch subjects',
                code: 'MODEL_ERROR'
            };
        }
    },

    async update(courseSubjectId, data) {
        try {
            const checkQuery = `
                SELECT id, classroom_id, subject_id, hours_per_week, active
                FROM course_subjects
                WHERE id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [courseSubjectId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Course subject not found',
                    code: 'NOT_FOUND'
                };
            }

            const currentData = checkResult.rows[0];

            const fieldsToUpdate = [];
            const values = [];

            // Solo permitir actualización de subject_id, hours_per_week y active
            // classroom_id NO se puede cambiar desde esta función
            
            if (data.subject_id !== undefined && data.subject_id !== currentData.subject_id) {
                fieldsToUpdate.push('subject_id = ?');
                values.push(data.subject_id);
            }

            if (data.hours_per_week !== undefined && data.hours_per_week !== currentData.hours_per_week) {
                fieldsToUpdate.push('hours_per_week = ?');
                values.push(data.hours_per_week);
            }

            if (data.active !== undefined && data.active !== currentData.active) {
                fieldsToUpdate.push('active = ?');
                values.push(data.active);
            }

            if (fieldsToUpdate.length === 0) {
                return {
                    success: true,
                    data: {
                        id: courseSubjectId,
                        updated: false,
                        message: 'No changes detected',
                        currentData: currentData
                    }
                };
            }

            // Si cambia subject_id, verificar que no exista duplicado en la misma clase
            if (data.subject_id !== undefined && data.subject_id !== currentData.subject_id) {
                const duplicateQuery = `
                    SELECT id FROM course_subjects
                    WHERE classroom_id = ? AND subject_id = ? AND id != ? AND active = 1
                `;

                const duplicateResult = await turso.execute({
                    sql: duplicateQuery,
                    args: [currentData.classroom_id, data.subject_id, courseSubjectId]
                });

                if (duplicateResult.rows.length > 0) {
                    return {
                        success: false,
                        error: 'This subject is already assigned to this classroom',
                        code: 'DUPLICATE_SUBJECT'
                    };
                }
            }

            values.push(courseSubjectId);

            const updateQuery = `
                UPDATE course_subjects
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?
            `;

            const updateResult = await turso.execute({
                sql: updateQuery,
                args: values
            });

            if (updateResult.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to update course subject',
                    code: 'UPDATE_FAILED'
                };
            }

            return {
                success: true,
                data: {
                    id: courseSubjectId,
                    updated: true,
                    rowsAffected: updateResult.rowsAffected,
                    updatedFields: fieldsToUpdate.length,
                }
            };

        } catch (error) {
            console.error('Model: Error updating course subject:', error);
            
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return {
                    success: false,
                    error: 'This subject is already assigned to this classroom',
                    code: 'CONSTRAINT_VIOLATION'
                };
            }

            return {
                success: false,
                error: 'Failed to update course subject',
                code: 'MODEL_ERROR'
            };
        }
    },

    async delete(courseSubjectId) {
        try {
            // Verificar que la asignación exista
            const checkQuery = `
                SELECT 
                    cs.id,
                    cs.classroom_id,
                    cs.subject_id,
                    cs.active,
                    s.name as subject_name,
                    s.code as subject_code,
                    CONCAT(g.name_short, ' "', p.name, '"') as classroom_name
                FROM course_subjects cs
                INNER JOIN subjects s ON cs.subject_id = s.id
                INNER JOIN classrooms c ON cs.classroom_id = c.id
                INNER JOIN grades g ON c.grade_id = g.id
                INNER JOIN parallels p ON c.parallel_id = p.id
                WHERE cs.id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [courseSubjectId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Course subject not found',
                    code: 'NOT_FOUND'
                };
            }

            const courseSubjectData = checkResult.rows[0];

            // Hard delete - eliminar físicamente el registro
            const deleteQuery = `
                DELETE FROM course_subjects
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: deleteQuery,
                args: [courseSubjectId]
            });

            if (result.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to delete course subject',
                    code: 'DELETE_FAILED'
                };
            }

            return {
                success: true,
                data: {
                    id: courseSubjectId,
                    subject_name: courseSubjectData.subject_name,
                    subject_code: courseSubjectData.subject_code,
                    classroom_name: courseSubjectData.classroom_name,
                    deleted: true
                },
                message: 'Course subject deleted permanently'
            };

        } catch (error) {
            console.error('Model: Error deleting course subject:', error);
            
            // Manejar errores de integridad referencial
            if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
                return {
                    success: false,
                    error: 'Cannot delete course subject: it has related records (assignments, grades, etc.)',
                    code: 'FOREIGN_KEY_CONSTRAINT'
                };
            }
            
            return {
                success: false,
                error: 'Failed to delete course subject',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getSubjectsByClassroom(classroomId) {
        try {
            const query = `
                SELECT 
                    s.id,
                    s.name,
                    CASE 
                        WHEN ta.teacher_id IS NOT NULL 
                        THEN t.first_name || ' ' || t.last_name 
                        ELSE NULL 
                    END as teacher_name,
                    cs.hours_per_week,
                    cs.id as course_subject_id
                FROM course_subjects cs
                INNER JOIN subjects s ON cs.subject_id = s.id
                INNER JOIN classrooms c ON cs.classroom_id = c.id
                LEFT JOIN teacher_assignments ta ON cs.id = ta.course_subject_id 
                    AND ta.academic_year_id = c.academic_year_id
                    AND ta.active = 1
                LEFT JOIN teachers t ON ta.teacher_id = t.id
                WHERE cs.classroom_id = ? AND cs.active = 1
                ORDER BY s.name
            `;

            const result = await turso.execute({
                sql: query,
                args: [classroomId]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'No subjects found for this classroom',
                    code: 'NO_SUBJECTS_FOUND'
                };
            }

            return {
                success: true,
                data: result.rows,
                message: `Found ${result.rows.length} subject(s) for this classroom`
            };

        } catch (error) {
            console.error('Model: Error getting subjects by classroom:', error);
            return {
                success: false,
                message: 'Failed to get subjects for classroom',
                code: 'MODEL_ERROR'
            };
        }
    },

    async searchClassroom(searchTerm, page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const normalizedSearchTerm = searchTerm
                .toUpperCase()
                .replace(/[ÁÀÂÃÄ]/g, 'A')
                .replace(/[ÉÈÊË]/g, 'E')
                .replace(/[ÍÌÎÏ]/g, 'I')
                .replace(/[ÓÒÔÕÖ]/g, 'O')
                .replace(/[ÚÙÛÜ]/g, 'U')
                .replace(/Ñ/g, 'N');

            const countQuery = `
                SELECT COUNT(*) as total
                FROM classrooms c 
                    INNER JOIN grades g ON c.grade_id = g.id 
                    INNER JOIN parallels p ON c.parallel_id = p.id 
                WHERE c.active = 1 
                    AND c.institution_id = (SELECT id FROM institutions WHERE active = 1 LIMIT 1) 
                    AND c.academic_year_id = ( 
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1 
                    )
                    AND (
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.classroom_code, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(CONCAT(g.name_short, ' "', p.name, '"'), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%')
                    )
            `;

            const dataQuery = `
                SELECT
                    c.id AS classroom_id,
                    c.classroom_code,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name, 
                    c.schedule
                FROM classrooms c
                    INNER JOIN grades g ON c.grade_id = g.id
                    INNER JOIN parallels p ON c.parallel_id = p.id
                WHERE c.active = 1
                    AND c.institution_id = (SELECT id FROM institutions WHERE active = 1 LIMIT 1)
                    AND c.academic_year_id = (
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                    )
                    AND (
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.classroom_code, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(CONCAT(g.name_short, ' "', p.name, '"'), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%')
                    )
                ORDER BY g.order_number, p.name
                LIMIT ? OFFSET ?;
            `;

            const searchPattern = `%${normalizedSearchTerm}%`;

            const [countResult, dataResult] = await Promise.all([
                turso.execute({
                    sql: countQuery,
                    args: [searchPattern, searchPattern]
                }),
                turso.execute({
                    sql: dataQuery,
                    args: [searchPattern, searchPattern, limitNum, offset]
                })
            ]);

            const total = countResult.rows[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);

            if (dataResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'No subjects found',
                    code: 'NO_SUBJECTS'
                };
            }

            return {
                success: true,
                data: {
                    classrooms: dataResult.rows,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: totalPages,
                        totalItems: total,
                        itemsPerPage: limitNum,
                        hasNextPage: pageNum < totalPages,
                        hasPreviousPage: pageNum > 1
                    }
                },
                message: `Found ${total} classroom(s) matching search criteria`
            };

        } catch (error) {
            console.error('Model: Error searching classrooms:', error);
            return {
                success: false,
                error: 'Failed to search classrooms',
                code: 'MODEL_ERROR'
            };
        }
    }
}
