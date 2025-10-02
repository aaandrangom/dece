import { turso } from '../database/client.js';

export const ClassroomModel = {
    async create(data) {
        try {
            const insertQuery = `
                INSERT INTO classrooms(
                    institution_id, academic_year_id, 
                    grade_id, parallel_id, capacity, 
                    classroom_code, location, schedule
                ) VALUES (
                    (SELECT id FROM institutions WHERE active = 1 LIMIT 1), 
                    (SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1), 
                    ?, ?, ?, ?, ?, ?
                );
            `;

            const result = await turso.execute({
                sql: insertQuery,
                args: [
                    data.grade_id,
                    data.parallel_id,
                    data.capacity,
                    data.classroom_code,
                    data.location,
                    data.schedule
                ]
            });

            if (result.rowsAffected === 0) {
                throw new Error('No rows were inserted');
            }

            const classroomId = Number(result.lastInsertRowid);
            return {
                success: true,
                data: { id: classroomId }
            };
        } catch (error) {
            console.error('Model: Error creating classroom:', error);

            if (error.message && error.message.includes('schedule IN')) {
                return {
                    success: false,
                    message: 'Schedule must be one of: MATUTINA, VESPERTINA, NOCTURNA',
                    code: 'INVALID_SCHEDULE'
                };
            }

            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('classrooms.institution_id, classrooms.academic_year_id, classrooms.grade_id, classrooms.parallel_id')) {
                    return {
                        success: false,
                        message: 'A classroom with these details already exists',
                        code: 'CLASSROOM_ALREADY_EXISTS'
                    };
                }
            }

            return {
                success: false,
                message: 'Failed to create classroom',
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
                FROM classrooms
                WHERE active = true;
            `;

            const dataQuery = `
                SELECT
                    c.id AS classroom_id,
                    c.classroom_code,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name, 
                    c.schedule,
                    c.location
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
            }
        } catch (error) {
            console.error('Model: Error fetching classrooms:', error);
            return {
                success: false,
                message: 'Failed to fetch classrooms',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getGrades() {
        try {
            const query = `
                SELECT id, name_short 
                FROM grades
                WHERE institution_id = (
                    SELECT id 
                    FROM institutions 
                    WHERE active = 1 LIMIT 1
                ) AND active = 1
                ORDER BY order_number;
            `;

            const result = await turso.execute(query);
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Failed to fetch grades',
                    code: 'NOT_FOUND_GRADES'
                };
            }

            return {
                success: true,
                data: result.rows,
                message: 'Grades retrieved successfully'
            };
        } catch (error) {
            console.error('Model: Error fetching grades:', error);
            return {
                success: false,
                error: 'Failed to fetch grades',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getParallels() {
        try {
            const query = `
                SELECT id, name
                FROM parallels
                WHERE institution_id = (
                    SELECT id
                    FROM institutions
                    WHERE active = 1 LIMIT 1
                ) AND active = 1
                ORDER BY id;
            `;

            const result = await turso.execute(query);
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'No parallels found',
                    code: 'NO_PARALLELS'
                };
            }

            return {
                success: true,
                data: result.rows,
                message: 'Parallels retrieved successfully'
            };
        } catch (error) {
            console.error('Model: Error fetching parallels:', error);
            return {
                success: false,
                error: 'Failed to fetch parallels',
                code: 'MODEL_ERROR'
            };
        }
    },

    async getDetailsById(classroomId) {
        try {
            const query = `
                SELECT 
                    c.id AS classroom_id, 
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name, 
                    c.classroom_code,
                    g.name_full as classroom_name_full, 
                    c.capacity, 
                    c.schedule, 
                    c.location,
                    c.active,
                    COUNT(se.student_id) as enrolled_students 
                FROM classrooms c 
                    INNER JOIN grades g ON c.grade_id = g.id 
                    INNER JOIN parallels p ON c.parallel_id = p.id 
                    LEFT JOIN student_enrollments se ON c.id = se.classroom_id 
                        AND se.academic_year_id = c.academic_year_id 
                        AND se.status = 'ENROLLED' 
                        AND se.active = 1 
                WHERE c.active = 1 
                    AND c.institution_id = (SELECT id FROM institutions WHERE active = 1 LIMIT 1) 
                    AND c.academic_year_id = ( 
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1 
                    )
                    AND c.id = ?  -- Filtro por ID de classroom específico
                GROUP BY c.id, g.name_short, p.name, g.name_full, c.capacity, c.schedule 
                ORDER BY g.order_number, p.name;
            `;

            const result = await turso.execute({ sql: query, args: [classroomId] });
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Classroom not found',
                    code: 'CLASSROOM_NOT_FOUND'
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: 'Classroom details retrieved successfully'
            };
        } catch (error) {
            console.error('Model: Error fetching classroom details:', error);
            return {
                success: false,
                error: 'Failed to fetch classroom details',
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
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(g.name_full, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(g.name_short, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.name, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(CONCAT(g.name_short, ' "', p.name, '"'), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%')
                    )
            `;

            const dataQuery = `
                SELECT 
                    c.id AS classroom_id,
                    c.classroom_code,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name, 
                    c.schedule,
                    c.location 
                FROM classrooms c 
                    INNER JOIN grades g ON c.grade_id = g.id 
                    INNER JOIN parallels p ON c.parallel_id = p.id 
                    LEFT JOIN student_enrollments se ON c.id = se.classroom_id 
                        AND se.academic_year_id = c.academic_year_id 
                        AND se.status = 'ENROLLED' 
                        AND se.active = 1 
                WHERE c.active = 1 
                    AND c.institution_id = (SELECT id FROM institutions WHERE active = 1 LIMIT 1) 
                    AND c.academic_year_id = ( 
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1 
                    )
                    AND (
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(g.name_full, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(g.name_short, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.name, 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%') OR
                        UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(CONCAT(g.name_short, ' "', p.name, '"'), 'Á', 'A'), 'É', 'E'), 'Í', 'I'), 'Ó', 'O'), 'Ú', 'U'), 'Ñ', 'N')) LIKE CONCAT('%', ?, '%')
                    )
                GROUP BY c.id, g.name_short, p.name, g.name_full, c.capacity, c.schedule 
                ORDER BY g.order_number, p.name
                LIMIT ? OFFSET ?
            `;

            const searchPattern = `%${normalizedSearchTerm}%`;

            const [countResult, dataResult] = await Promise.all([
                turso.execute({
                    sql: countQuery,
                    args: [searchPattern, searchPattern, searchPattern, searchPattern]
                }),
                turso.execute({
                    sql: dataQuery,
                    args: [searchPattern, searchPattern, searchPattern, searchPattern, limitNum, offset]
                })
            ]);

            const total = countResult.rows[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);

            if (dataResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'No classrooms found matching the search criteria',
                    code: 'NOT_FOUND'
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
                message: `Found ${total} classroom(s) matching search criteria (page ${pageNum} of ${totalPages})`
            };
        } catch (error) {
            console.error('Model: Error searching classrooms:', error);
            return {
                success: false,
                error: 'Failed to search classrooms',
                code: 'MODEL_ERROR'
            };
        }
    },

    async update(classroomId, data) {
        try {
            const checkQuery = `
                SELECT capacity, location, active
                FROM classrooms
                WHERE id = ?;
            `;
            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [classroomId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Classroom not found',
                    code: 'NOT_FOUND'
                };
            }

            const currentData = checkResult.rows[0];

            const fieldsToUpdate = [];
            const values = [];

            if (data.capacity && data.capacity !== currentData.capacity) {
                fieldsToUpdate.push('capacity = ?');
                values.push(data.capacity);
            }

            if (data.location && data.location !== currentData.location) {
                fieldsToUpdate.push('location = ?');
                values.push(data.location);
            }

            if (data.active !== currentData.active) {
                fieldsToUpdate.push('active = ?');
                values.push(data.active ? 1 : 0);
            }

            console.log('Fields to update:', fieldsToUpdate);
            console.log('Values:', values);

            if (fieldsToUpdate.length === 0) {
                return {
                    success: true,
                    data: {
                        id: classroomId,
                        message: 'No changes detected',
                        update: false,
                        currentData: currentData
                    }
                };
            }

            values.push(classroomId);

            const updateQuery = `
                UPDATE classrooms
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?;
            `;

            const updateResult = await turso.execute({
                sql: updateQuery,
                args: values
            });

            return {
                success: true,
                data: {
                    id: classroomId,
                    message: 'Classroom updated successfully',
                    update: true
                }
            };
        } catch (error) {
            console.error('Model: Unexpected error updating classroom:', error);
            return {
                success: false,
                error: 'Unexpected server error',
                code: 'MODEL_ERROR'
            };
        }
    },
};