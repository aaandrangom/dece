import { turso } from '../database/client.js';

export const TeacherModel = {
    async create(data) {
        const client = await turso.transaction();
        try {
            const insertQuery = `
                INSERT INTO teachers(
                    institution_id, id_number, first_name, 
                    last_name, email, phone, phone_alt
                ) VALUES( ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await client.execute({
                sql: insertQuery,
                args: [
                    data.institution_id,
                    data.id_number,
                    data.first_name,
                    data.last_name,
                    data.email,
                    data.phone,
                    data.phone_alt || null
                ]
            })

            if (result.rowsAffected === 0) {
                throw new Error('No rows were inserted');
            }

            const teacherId = Number(result.lastInsertRowid);

            if (data.classroom_id && data.academic_year_id) {
                const tutorInsert = `
                    INSERT INTO classroom_tutors(
                        classroom_id, teacher_id, 
                        academic_year_id, start_date, notes
                    ) VALUES( ?, ?, ?, ?, ?)
                `;

                await client.execute({
                    sql: tutorInsert,
                    args: [
                        data.classroom_id,
                        teacherId,
                        data.academic_year_id,
                        data.start_date || null,
                        data.notes || null
                    ]
                });
            }

            if (data.course_subject_id && data.academic_year_id) {
                const assignmentInsert = `
                    INSERT INTO teacher_assignments(
                        teacher_id, course_subject_id,
                        academic_year_id, start_date, notes
                    ) VALUES( ?, ?, ?, ?, ?)
                `;

                await client.execute({
                    sql: assignmentInsert,
                    args: [
                        teacherId,
                        data.course_subject_id,
                        data.academic_year_id,
                        data.start_date || null,
                        data.notes || null
                    ]
                });
            }

            await client.commit();

            return {
                success: true,
                data: {
                    id: teacherId,
                    teacher_created: true,
                    classroom_tutor_assigned: !!(data.classroom_id && data.academic_year_id),
                    subject_assigned: !!(data.course_subject_id && data.academic_year_id)
                }
            }
        } catch (error) {
            console.log('Model: Error creating teacher:', error);
            await client.rollback();

            // Manejo de errores específicos
            if (error.message.includes('Missing required teacher fields')) {
                return {
                    success: false,
                    error: error.message,
                    code: 'MISSING_REQUIRED_FIELDS'
                };
            }

            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('teachers.email')) {
                    return {
                        success: false,
                        error: 'A teacher with this email already exists',
                        code: 'EMAIL_ALREADY_EXISTS'
                    };
                }
                if (error.message.includes('teachers.id_number')) {
                    return {
                        success: false,
                        error: 'A teacher with this ID number already exists',
                        code: 'ID_NUMBER_ALREADY_EXISTS'
                    };
                }
            }

            return {
                success: false,
                error: error.message || 'Failed to create teacher',
                code: 'CREATION_FAILED'
            };
        }
    },

    async getTeacherByInstitution(institutionId, page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM teachers
                WHERE institution_id = ? AND active = true
            `;

            const dataQuery = `
                SELECT 
                    id, id_number, 
                    first_name || ' ' || last_name as full_name,
                    email, phone
                FROM teachers
                WHERE institution_id = ? AND active = true
                ORDER BY last_name
                LIMIT ? OFFSET ?
            `;

            const [countResult, dataResult] = await Promise.all([
                turso.execute({
                    sql: countQuery,
                    args: [institutionId]
                }),
                turso.execute({
                    sql: dataQuery,
                    args: [institutionId, limitNum, offset]
                })
            ]);

            const total = countResult.rows[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);

            if (dataResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'No teachers found for this institution',
                    code: 'NOT_FOUND'
                };
            }

            return {
                success: true,
                data: {
                    teachers: dataResult.rows,
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
            console.log('Model: Error finding teachers by institution:', error);
            return {
                success: false,
                error: error.message,
                code: 'FIND_FAILED'
            };
        }
    },

    async searchTeacher(institutionId, searchTerm, page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const optimizedQuery = `
                SELECT
                    id, id_number,
                    first_name || ' ' || last_name as full_name,
                    email, phone,
                    COUNT(*) OVER() as total_count
                FROM teachers 
                WHERE institution_id = ? 
                AND active = true
                AND (
                    id_number LIKE ?
                    OR first_name LIKE ?
                    OR last_name LIKE ?
                )
                ORDER BY last_name
                LIMIT ? OFFSET ?
            `;

            const searchPattern = `%${searchTerm}%`;

            const result = await turso.execute({
                sql: optimizedQuery,
                args: [institutionId, searchPattern, searchPattern, searchPattern, limitNum, offset]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'No teachers found matching the search criteria',
                    code: 'NOT_FOUND'
                };
            }

            const total = result.rows[0]?.total_count || 0;
            const teachers = result.rows.map(({ total_count, ...teacher }) => teacher);
            const totalPages = Math.ceil(total / limitNum);

            return {
                success: true,
                data: {
                    teachers,
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalItems: total,
                        itemsPerPage: limitNum,
                        hasNextPage: pageNum < totalPages,
                        hasPreviousPage: pageNum > 1
                    }
                }
            };
        } catch (error) {
            console.log('Model: Error searching teachers:', error);
            return {
                success: false,
                error: error.message,
                code: 'SEARCH_FAILED'
            };
        }
    },

    async getDetailsById(teacherId, { includeInactive = false } = {}) {
        try {
            const teacherFilter = includeInactive ? '' : 'AND t.active = 1';
            const tutorFilter = includeInactive ? '' : 'AND ct.active = 1';
            const assignmentFilter = includeInactive ? '' : 'AND ta.active = 1';

            const basicInfoQuery = `
                SELECT
                    id, id_number,
                    first_name || ' ' || last_name AS full_name,
                    email, phone, phone_alt, active,
                    created_at
                FROM teachers t
                WHERE id = ? ${teacherFilter}
            `;

            const tutorInfoQuery = `
                SELECT 
                    ct.*,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_full_name,
                    g.name_full AS grade_name,
                    c.schedule,
                    c.capacity,
                    COUNT(se.student_id) AS enrolled_students
                FROM classroom_tutors ct
                INNER JOIN classrooms c ON ct.classroom_id = c.id
                INNER JOIN grades g ON c.grade_id = g.id
                INNER JOIN parallels p ON c.parallel_id = p.id
                LEFT JOIN student_enrollments se ON c.id = se.classroom_id 
                    AND se.academic_year_id = ct.academic_year_id
                    AND se.status = 'ENROLLED'
                    AND se.active = 1
                WHERE ct.teacher_id = ?
                    AND ct.academic_year_id = (
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                    )
                    ${tutorFilter}
                GROUP BY ct.id;
            `;

            const additionalInfoQuery = `
                SELECT 
                    s.name AS subject_name,
                    s.code AS subject_code,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name,
                    cs.hours_per_week,
                    c.schedule,
                    ta.start_date,
                    ta.end_date,
                    ta.course_subject_id,
                    ta.notes,
                    ta.id AS assignment_id,
                    COUNT(DISTINCT se.student_id) AS total_students
                FROM teacher_assignments ta
                INNER JOIN course_subjects cs ON ta.course_subject_id = cs.id
                INNER JOIN subjects s ON cs.subject_id = s.id
                INNER JOIN classrooms c ON cs.classroom_id = c.id
                INNER JOIN grades g ON c.grade_id = g.id
                INNER JOIN parallels p ON c.parallel_id = p.id
                LEFT JOIN student_enrollments se ON c.id = se.classroom_id 
                    AND se.academic_year_id = ta.academic_year_id
                    AND se.status = 'ENROLLED'
                    AND se.active = 1
                WHERE ta.teacher_id = ?
                    AND ta.academic_year_id = (
                        SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                    )
                    ${assignmentFilter}
                GROUP BY ta.id, s.id, cs.id, c.id
                ORDER BY g.order_number, p.name, s.name;
            `;

            const [basicInfo, tutorInfo, additionalInfo] = await Promise.all([
                turso.execute({ sql: basicInfoQuery, args: [teacherId] }),
                turso.execute({ sql: tutorInfoQuery, args: [teacherId] }),
                turso.execute({ sql: additionalInfoQuery, args: [teacherId] })
            ]);

            if (basicInfo.rows.length === 0) {
                return {
                    success: false,
                    error: 'Teacher not found',
                    code: 'NOT_FOUND'
                };
            }

            return {
                success: true,
                data: {
                    basicInfo: basicInfo.rows[0],
                    tutorInfo: tutorInfo.rows,
                    additionalInfo: additionalInfo.rows
                }
            };
        } catch (error) {
            console.log('Model: Error getting teacher details by ID:', error);
            return {
                success: false,
                error: error.message,
                code: 'DETAILS_FAILED'
            };
        }
    },

    async getClassrooms(institutionId) {
        try {
            const query = `
                SELECT 
                    c.id AS classroom_id,
                    CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name,
                    g.name_full as classroom_name_full,
                    c.capacity,
                    c.schedule,
                    COUNT(se.student_id) as enrolled_students
                FROM classrooms c
                INNER JOIN grades g ON c.grade_id = g.id
                INNER JOIN parallels p ON c.parallel_id = p.id
                LEFT JOIN student_enrollments se ON c.id = se.classroom_id 
                    AND se.academic_year_id = c.academic_year_id
                    AND se.status = 'ENROLLED'
                    AND se.active = 1
                LEFT JOIN classroom_tutors ct ON c.id = ct.classroom_id 
                    AND ct.academic_year_id = c.academic_year_id
                    AND ct.active = 1
                WHERE c.active = 1 
                AND c.institution_id = ?
                AND c.academic_year_id = (
                    SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                )
                AND ct.id IS NULL  -- Solo aulas SIN tutor asignado
                GROUP BY c.id, g.name_short, p.name, g.name_full, c.capacity, c.schedule
                ORDER BY g.order_number, p.name
            `;

            const result = await turso.execute({
                sql: query,
                args: [institutionId]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'No classrooms available for tutor assignment found',
                    code: 'NOT_FOUND'
                };
            }

            return {
                success: true,
                data: result.rows,
                message: `Found ${result.rows.length} classroom(s) available for tutor assignment`
            };
        } catch (error) {
            console.log('Model: Error getting available classrooms:', error);
            return {
                success: false,
                error: error.message,
                code: 'FIND_FAILED'
            };
        }
    },

    async assignTutorToCourse(data) {
        try {
            const query = `
                INSERT INTO classroom_tutors(
                    classroom_id, teacher_id, academic_year_id,
                    start_date, end_date, notes
                )
                VALUES (?, ?, (
                    SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                ), ?, ?, ?)
            `;

            const result = await turso.execute({
                sql: query,
                args: [
                    data.classroom_id,
                    data.teacher_id,
                    data.start_date || null,
                    data.end_date || null,
                    data.notes || null
                ]
            });

            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.log('Model: Error assigning tutor to course:', error);

            if (error.code === 'SQLITE_CONSTRAINT') {
                return {
                    success: false,
                    error: 'Tutor is already assigned to this course',
                    code: 'ASSIGN_FAILED'
                };
            }

            return {
                success: false,
                error: error.message,
                code: 'ASSIGN_FAILED'
            };
        }
    },

    async getCourseSubjects(institutionId) {
        try {
            const query = `
                SELECT
                    cs.id AS course_subject_id,
                    CONCAT(g.name_short, ' "', p.name, '"', ' - ', s.name) AS classroom_name,
                    s.name AS subject_name,
                    s.code AS subject_code,
                    cs.hours_per_week,
                    c.schedule,
                    c.capacity,
                    COUNT(se.student_id) as enrolled_students
                FROM course_subjects cs
                INNER JOIN classrooms c ON cs.classroom_id = c.id
                INNER JOIN subjects s ON cs.subject_id = s.id
                INNER JOIN grades g ON c.grade_id = g.id
                INNER JOIN parallels p ON c.parallel_id = p.id
                LEFT JOIN student_enrollments se ON c.id = se.classroom_id 
                    AND se.academic_year_id = c.academic_year_id
                    AND se.status = 'ENROLLED'
                    AND se.active = 1
                LEFT JOIN teacher_assignments ta ON cs.id = ta.course_subject_id 
                    AND ta.academic_year_id = c.academic_year_id
                    AND ta.active = 1
                WHERE cs.active = 1
                AND c.institution_id = ?
                AND c.academic_year_id = (
                    SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                )
                AND ta.id IS NULL  -- Solo materias SIN profesor asignado
                GROUP BY cs.id, g.name_short, p.name, s.name, s.code, cs.hours_per_week, c.schedule, c.capacity
                ORDER BY g.order_number, p.name, s.name
            `;

            const result = await turso.execute({
                sql: query,
                args: [institutionId]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'No course subjects available for teacher assignment found',
                    code: 'NOT_FOUND'
                };
            }

            return {
                success: true,
                data: result.rows,
                message: `Found ${result.rows.length} course subject(s) available for teacher assignment`
            };
        } catch (error) {
            console.log('Model: Error getting available course subjects:', error);
            return {
                success: false,
                error: error.message,
                code: 'FIND_FAILED'
            };
        }
    },

    async assignToCourse(data) {
        console.log('Model: assignToCourse called with data:', data);
        try {
            const query = `
                INSERT INTO teacher_assignments(
                    teacher_id, course_subject_id, academic_year_id,
                    start_date, end_date, notes
                )
                VALUES (?, ?, (
                    SELECT id FROM academic_years WHERE current_year = 1 LIMIT 1
                ), ?, ?, ?)
            `;

            const result = await turso.execute({
                sql: query,
                args: [
                    data.teacher_id,
                    data.course_subject_id,
                    data.start_date || null,
                    data.end_date || null,
                    data.notes || null
                ]
            });

            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.log('Model: Error assigning teacher to course:', error);

            if (error.code === 'SQLITE_CONSTRAINT') {
                return {
                    success: false,
                    error: 'This subject and course are already assigned to a teacher.',
                    code: 'ASSIGN_FAILED'
                };
            }

            return {
                success: false,
                error: error.message,
                code: 'ASSIGN_FAILED'
            };
        }
    },

    async deleteAssignmentTutor(classroomTutorId) {
        try {
            // Verificar que la asignación exista y esté activa
            const checkQuery = `
                SELECT id, teacher_id, classroom_id, active,
                       (SELECT first_name || ' ' || last_name FROM teachers WHERE id = ct.teacher_id) as teacher_name,
                       (SELECT CONCAT(g.name_short, ' "', p.name, '"') 
                        FROM classrooms c 
                        JOIN grades g ON c.grade_id = g.id 
                        JOIN parallels p ON c.parallel_id = p.id 
                        WHERE c.id = ct.classroom_id) as classroom_name
                FROM classroom_tutors ct
                WHERE id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [classroomTutorId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Classroom tutor assignment not found',
                    code: 'NOT_FOUND'
                };
            }

            const assignmentData = checkResult.rows[0];

            if (!assignmentData.active) {
                return {
                    success: false,
                    error: 'Classroom tutor assignment is already inactive',
                    code: 'ALREADY_INACTIVE'
                };
            }

            // Soft delete - desactivar la asignación
            const deleteQuery = `
                UPDATE classroom_tutors
                SET active = 0
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: deleteQuery,
                args: [classroomTutorId]
            });

            if (result.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to deactivate tutor assignment',
                    code: 'UPDATE_FAILED'
                };
            }

            return {
                success: true,
                data: {
                    assignment_id: classroomTutorId,
                    teacher_name: assignmentData.teacher_name,
                    classroom_name: assignmentData.classroom_name,
                    deactivated: true
                },
                message: 'Classroom tutor assignment deactivated successfully'
            };

        } catch (error) {
            console.error('Model: Error soft-deleting tutor assignment:', error);
            return {
                success: false,
                error: error.message,
                code: 'DELETE_FAILED'
            };
        }
    },

    async updateClassroomTutor(classroomTutorId, data) {
        try {
            const checkQuery = `
                SELECT id, classroom_id, start_date, end_date, notes
                FROM classroom_tutors 
                WHERE id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [classroomTutorId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Classroom tutor not found',
                    code: 'NOT_FOUND'
                };
            }

            const currentData = checkResult.rows[0];

            const fieldsToUpdate = [];
            const values = [];

            if (data.classroom_id !== undefined && data.classroom_id !== currentData.classroom_id) {
                fieldsToUpdate.push('classroom_id = ?');
                values.push(data.classroom_id);
            }

            if (data.start_date !== undefined && data.start_date !== currentData.start_date) {
                fieldsToUpdate.push('start_date = ?');
                values.push(data.start_date);
            }

            if (data.end_date !== undefined && data.end_date !== currentData.end_date) {
                fieldsToUpdate.push('end_date = ?');
                values.push(data.end_date);
            }

            if (data.notes !== undefined && data.notes !== currentData.notes) {
                fieldsToUpdate.push('notes = ?');
                values.push(data.notes);
            }

            if (fieldsToUpdate.length === 0) {
                return {
                    success: true,
                    data: {
                        id: classroomTutorId,
                        message: 'No changes detected',
                        updated: false,
                        currentData: currentData
                    }
                };
            }

            values.push(classroomTutorId);

            const updateQuery = `
                UPDATE classroom_tutors
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: updateQuery,
                args: values
            });

            if (result.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to update classroom tutor',
                    code: 'UPDATE_FAILED'
                };
            }

            const updatedQuery = `
                SELECT ct.*, 
                       c.id as classroom_id,
                       CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name,
                       t.first_name, t.last_name,
                       t.first_name || ' ' || t.last_name as teacher_name
                FROM classroom_tutors ct
                LEFT JOIN classrooms c ON ct.classroom_id = c.id
                LEFT JOIN grades g ON c.grade_id = g.id
                LEFT JOIN parallels p ON c.parallel_id = p.id
                LEFT JOIN teachers t ON ct.teacher_id = t.id
                WHERE ct.id = ?
            `;

            const updatedResult = await turso.execute({
                sql: updatedQuery,
                args: [classroomTutorId]
            });

            return {
                success: true,
                data: {
                    id: classroomTutorId,
                    updated: true,
                    rowsAffected: result.rowsAffected,
                    updatedFields: fieldsToUpdate.length,
                    updatedData: updatedResult.rows[0] || null
                }
            };

        } catch (error) {
            console.error('Model: Error updating classroom tutor:', error);

            // Manejar errores específicos de SQLite
            if (error.message && error.message.includes('UNIQUE constraint failed: classroom_tutors.classroom_id, classroom_tutors.academic_year_id, classroom_tutors.active')) {
                return {
                    success: false,
                    error: 'This classroom already has an active tutor assigned for the current academic year. Please deactivate the current tutor first or choose a different classroom.',
                    code: 'CLASSROOM_ALREADY_HAS_TUTOR'
                };
            }

            // Otros errores de restricción de integridad
            if (error.message && error.message.includes('SQLITE_CONSTRAINT')) {
                return {
                    success: false,
                    error: 'The update violates database constraints. Please check if the classroom exists and is valid.',
                    code: 'CONSTRAINT_VIOLATION'
                };
            }

            // Error genérico
            return {
                success: false,
                error: 'Failed to update classroom tutor. Please try again or contact support.',
                code: 'UPDATE_FAILED'
            };
        }
    },

    async updateCourseAssignment(assignmentId, data) {
        console.log('Model: updateCourseAssignment called with assignmentId:', assignmentId, 'and data:', data);
        try {
            const checkQuery = `
                SELECT 
                    id, teacher_id, course_subject_id, 
                    start_date, end_date, notes
                FROM teacher_assignments
                WHERE id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [assignmentId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Teacher assignment not found',
                    code: 'NOT_FOUND'
                };
            }

            const currentData = checkResult.rows[0];

            const fieldsToUpdate = [];
            const values = [];

            if (data.course_subject_id !== undefined && data.course_subject_id !== currentData.course_subject_id) {
                fieldsToUpdate.push('course_subject_id = ?');
                values.push(data.course_subject_id);
            }

            if (data.start_date !== undefined && data.start_date !== currentData.start_date) {
                fieldsToUpdate.push('start_date = ?');
                values.push(data.start_date);
            }

            if (data.end_date !== undefined && data.end_date !== currentData.end_date) {
                fieldsToUpdate.push('end_date = ?');
                values.push(data.end_date);
            }

            if (data.notes !== undefined && data.notes !== currentData.notes) {
                fieldsToUpdate.push('notes = ?');
                values.push(data.notes);
            }

            if (fieldsToUpdate.length === 0) {
                return {
                    success: true,
                    data: {
                        id: assignmentId,
                        message: 'No changes detected',
                        updated: false,
                        currentData: currentData
                    }
                };
            }

            values.push(assignmentId);

            const updateQuery = `
                UPDATE teacher_assignments
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: updateQuery,
                args: values
            });

            if (result.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to update teacher assignment',
                    code: 'UPDATE_FAILED'
                };
            }

            const updatedQuery = `
                SELECT ta.*, 
                       cs.id as course_subject_id,
                       s.name as subject_name,
                       s.code as subject_code,
                       CONCAT(g.name_short, ' "', p.name, '"') AS classroom_name,
                       t.first_name, t.last_name,
                       t.first_name || ' ' || t.last_name as teacher_name,
                       cs.hours_per_week
                FROM teacher_assignments ta
                LEFT JOIN course_subjects cs ON ta.course_subject_id = cs.id
                LEFT JOIN subjects s ON cs.subject_id = s.id
                LEFT JOIN classrooms c ON cs.classroom_id = c.id
                LEFT JOIN grades g ON c.grade_id = g.id
                LEFT JOIN parallels p ON c.parallel_id = p.id
                LEFT JOIN teachers t ON ta.teacher_id = t.id
                WHERE ta.id = ?
            `;

            const updatedResult = await turso.execute({
                sql: updatedQuery,
                args: [assignmentId]
            });

            return {
                success: true,
                data: {
                    id: assignmentId,
                    updated: true,
                    rowsAffected: result.rowsAffected,
                    updatedFields: fieldsToUpdate.length,
                    updatedData: updatedResult.rows[0] || null
                }
            };
        } catch (error) {
            console.error('Model: Error updating teacher assignment:', error);

            if (error.message && error.message.includes('UNIQUE constraint failed: teacher_assignments.teacher_id, teacher_assignments.course_subject_id, teacher_assignments.academic_year_id, teacher_assignments.active')) {
                return {
                    success: false,
                    error: 'This teacher is already assigned to this course subject for the current academic year. Please choose a different course subject or deactivate the existing assignment.',
                    code: 'TEACHER_ALREADY_ASSIGNED'
                };
            }

            if (error.message && error.message.includes('SQLITE_CONSTRAINT')) {
                return {
                    success: false,
                    error: 'The update violates database constraints. Please check if the course subject exists and is valid.',
                    code: 'CONSTRAINT_VIOLATION'
                };
            }

            return {
                success: false,
                error: 'Failed to update teacher assignment. Please try again or contact support.',
                code: 'UPDATE_FAILED'
            };
        }
    },

    async deleteAssignment(assignmentId) {
        try {
            // Verificar que la asignación exista y esté activa
            const checkQuery = `
                SELECT ta.id, ta.teacher_id, ta.course_subject_id, ta.active,
                       (SELECT first_name || ' ' || last_name FROM teachers WHERE id = ta.teacher_id) as teacher_name,
                       s.name as subject_name,
                       s.code as subject_code,
                       CONCAT(g.name_short, ' "', p.name, '"') as classroom_name
                FROM teacher_assignments ta
                LEFT JOIN course_subjects cs ON ta.course_subject_id = cs.id
                LEFT JOIN subjects s ON cs.subject_id = s.id
                LEFT JOIN classrooms c ON cs.classroom_id = c.id
                LEFT JOIN grades g ON c.grade_id = g.id
                LEFT JOIN parallels p ON c.parallel_id = p.id
                WHERE ta.id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [assignmentId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Teacher assignment not found',
                    code: 'NOT_FOUND'
                };
            }

            const assignmentData = checkResult.rows[0];

            if (!assignmentData.active) {
                return {
                    success: false,
                    error: 'Teacher assignment is already inactive',
                    code: 'ALREADY_INACTIVE'
                };
            }

            // Soft delete - desactivar la asignación
            const deleteQuery = `
                UPDATE teacher_assignments
                SET active = 0
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: deleteQuery,
                args: [assignmentId]
            });

            if (result.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to deactivate teacher assignment',
                    code: 'UPDATE_FAILED'
                };
            }

            return {
                success: true,
                data: {
                    assignment_id: assignmentId,
                    teacher_name: assignmentData.teacher_name,
                    subject_name: assignmentData.subject_name,
                    subject_code: assignmentData.subject_code,
                    classroom_name: assignmentData.classroom_name,
                    deactivated: true
                },
                message: 'Teacher assignment deactivated successfully'
            };

        } catch (error) {
            console.error('Model: Error soft-deleting teacher assignment:', error);
            return {
                success: false,
                error: error.message,
                code: 'DELETE_FAILED'
            };
        }
    },

    async updateTeacher(teacherId, data) {
        try {
            const checkQuery = `
                SELECT id, id_number, first_name, last_name, email, 
                       phone, phone_alt, active
                FROM teachers 
                WHERE id = ?
            `;

            const checkResult = await turso.execute({
                sql: checkQuery,
                args: [teacherId]
            });

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Teacher not found',
                    code: 'NOT_FOUND'
                };
            }

            const currentData = checkResult.rows[0];

            const fieldsToUpdate = [];
            const values = [];

            if (data.id_number !== undefined && data.id_number !== currentData.id_number) {
                fieldsToUpdate.push('id_number = ?');
                values.push(data.id_number);
            }

            if (data.first_name !== undefined && data.first_name !== currentData.first_name) {
                fieldsToUpdate.push('first_name = ?');
                values.push(data.first_name);
            }

            if (data.last_name !== undefined && data.last_name !== currentData.last_name) {
                fieldsToUpdate.push('last_name = ?');
                values.push(data.last_name);
            }

            if (data.email !== undefined && data.email !== currentData.email) {
                fieldsToUpdate.push('email = ?');
                values.push(data.email);
            }

            if (data.phone !== undefined && data.phone !== currentData.phone) {
                fieldsToUpdate.push('phone = ?');
                values.push(data.phone);
            }

            if (data.phone_alt !== undefined && data.phone_alt !== currentData.phone_alt) {
                fieldsToUpdate.push('phone_alt = ?');
                values.push(data.phone_alt);
            }

            if (data.active !== undefined && data.active !== currentData.active) {
                fieldsToUpdate.push('active = ?');
                values.push(data.active);
            }

            if (fieldsToUpdate.length === 0) {
                return {
                    success: true,
                    data: {
                        id: teacherId,
                        message: 'No changes detected',
                        updated: false,
                        currentData: currentData
                    }
                };
            }

            if (data.email !== undefined || data.id_number !== undefined) {
                const duplicateQuery = `
                    SELECT id, email, id_number 
                    FROM teachers 
                    WHERE (email = ? OR id_number = ?) AND id != ?
                `;

                const duplicateResult = await turso.execute({
                    sql: duplicateQuery,
                    args: [
                        data.email || currentData.email,
                        data.id_number || currentData.id_number,
                        teacherId
                    ]
                });

                if (duplicateResult.rows.length > 0) {
                    const duplicateRow = duplicateResult.rows[0];
                    let errorMessage = 'A teacher already exists with ';

                    if (duplicateRow.email === (data.email || currentData.email) &&
                        duplicateRow.id_number === (data.id_number || currentData.id_number)) {
                        errorMessage += 'the same email and ID number';
                    } else if (duplicateRow.email === (data.email || currentData.email)) {
                        errorMessage += 'the same email';
                    } else {
                        errorMessage += 'the same ID number';
                    }

                    return {
                        success: false,
                        error: errorMessage,
                        code: 'DUPLICATE_TEACHER'
                    };
                }
            }

            values.push(teacherId);

            const updateQuery = `
                UPDATE teachers
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: updateQuery,
                args: values
            });

            if (result.rowsAffected === 0) {
                return {
                    success: false,
                    error: 'Failed to update teacher',
                    code: 'UPDATE_FAILED'
                };
            }

            const updatedQuery = `
                SELECT id, id_number, first_name, last_name, email,
                       phone, phone_alt, active, created_at,
                       first_name || ' ' || last_name as full_name
                FROM teachers
                WHERE id = ?
            `;

            const updatedResult = await turso.execute({
                sql: updatedQuery,
                args: [teacherId]
            });

            return {
                success: true,
                data: {
                    id: teacherId,
                    updated: true,
                    rowsAffected: result.rowsAffected,
                    updatedFields: fieldsToUpdate.length,
                    updatedData: updatedResult.rows[0] || null
                }
            };

        } catch (error) {
            console.error('Model: Error updating teacher:', error);

            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                if (error.message.includes('teachers.email')) {
                    return {
                        success: false,
                        error: 'A teacher with this email already exists. Please use a different email address.',
                        code: 'EMAIL_ALREADY_EXISTS'
                    };
                }
                if (error.message.includes('teachers.id_number')) {
                    return {
                        success: false,
                        error: 'A teacher with this ID number already exists. Please use a different ID number.',
                        code: 'ID_NUMBER_ALREADY_EXISTS'
                    };
                }
            }

            if (error.message && error.message.includes('SQLITE_CONSTRAINT')) {
                return {
                    success: false,
                    error: 'The update violates database constraints. Please check your data.',
                    code: 'CONSTRAINT_VIOLATION'
                };
            }

            return {
                success: false,
                error: 'Failed to update teacher. Please try again or contact support.',
                code: 'UPDATE_FAILED'
            };
        }
    },

    async getOnlyInfoTeachers(teacherId) {
        try {
            if (!teacherId || teacherId <= 0) {
                return {
                    success: false,
                    error: 'Invalid teacher ID provided',
                    code: 'INVALID_INPUT'
                };
            }

            const query = `
                SELECT 
                    id, 
                    id_number,
                    first_name, 
                    last_name,
                    email, 
                    phone, 
                    phone_alt, 
                    active,
                    created_at
                FROM teachers
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: query,
                args: [teacherId]
            });

            if (result.rows.length === 0) {
                // Verificar si el profesor existe pero está inactivo
                const inactiveCheckQuery = `
                    SELECT id FROM teachers WHERE id = ? AND active = 0
                `;

                const inactiveResult = await turso.execute({
                    sql: inactiveCheckQuery,
                    args: [teacherId]
                });

                if (inactiveResult.rows.length > 0) {
                    return {
                        success: false,
                        error: 'Teacher is inactive',
                        code: 'TEACHER_INACTIVE'
                    };
                }

                return {
                    success: false,
                    error: 'Teacher not found',
                    code: 'NOT_FOUND'
                };
            }

            // Agregar campos computados para mejor UX
            const teacherData = result.rows[0];
            const enhancedData = {
                ...teacherData,
                has_phone: !!teacherData.phone,
                has_alt_phone: !!teacherData.phone_alt,
                account_age_days: teacherData.created_at ?
                    Math.floor((new Date() - new Date(teacherData.created_at)) / (1000 * 60 * 60 * 24)) : null
            };

            return {
                success: true,
                data: enhancedData
            };

        } catch (error) {
            console.error('Model: Error getting teacher info:', error);
            return {
                success: false,
                error: 'Failed to retrieve teacher information. Please try again.',
                code: 'DATABASE_ERROR'
            };
        }
    },

    async softDeleteTeacher(teacherId) {
        const client = await turso.transaction();
        try {
            const checkQuery = `
                SELECT id, active, first_name || ' ' || last_name as full_name
                FROM teachers 
                WHERE id = ?
            `;

            const checkResult = await client.execute({
                sql: checkQuery,
                args: [teacherId]
            });

            if (checkResult.rows.length === 0) {
                await client.rollback();
                return {
                    success: false,
                    error: 'Teacher not found',
                    code: 'NOT_FOUND'
                };
            }

            if (!checkResult.rows[0].active) {
                await client.rollback();
                return {
                    success: false,
                    error: 'Teacher is already inactive',
                    code: 'ALREADY_INACTIVE'
                };
            }

            const checkAssignmentsQuery = `
                SELECT 
                    (
                        SELECT COUNT(*) 
                        FROM classroom_tutors 
                        WHERE teacher_id = ? AND active = 1
                    ) as tutor_assignments,
                    (
                        SELECT COUNT(*) 
                        FROM teacher_assignments 
                        WHERE teacher_id = ? AND active = 1
                    ) as subject_assignments
            `;

            const assignmentsResult = await client.execute({
                sql: checkAssignmentsQuery,
                args: [teacherId, teacherId]
            });

            const tutorCount = assignmentsResult.rows[0]?.tutor_assignments || 0;
            const subjectCount = assignmentsResult.rows[0]?.subject_assignments || 0;

            let tutorResult = { rowsAffected: 0 };
            if (tutorCount > 0) {
                const deactivateTutorsQuery = `
                    UPDATE classroom_tutors 
                    SET active = 0 
                    WHERE teacher_id = ? AND active = 1
                `;

                tutorResult = await client.execute({
                    sql: deactivateTutorsQuery,
                    args: [teacherId]
                });
            }

            let assignmentResult = { rowsAffected: 0 };
            if (subjectCount > 0) {
                const deactivateAssignmentsQuery = `
                    UPDATE teacher_assignments 
                    SET active = 0 
                    WHERE teacher_id = ? AND active = 1
                `;

                assignmentResult = await client.execute({
                    sql: deactivateAssignmentsQuery,
                    args: [teacherId]
                });
            }

            const updateTeacherQuery = `
                UPDATE teachers 
                SET active = 0 
                WHERE id = ?
            `;

            const teacherResult = await client.execute({
                sql: updateTeacherQuery,
                args: [teacherId]
            });

            if (teacherResult.rowsAffected === 0) {
                await client.rollback();
                return {
                    success: false,
                    error: 'Failed to deactivate teacher',
                    code: 'UPDATE_FAILED'
                };
            }

            await client.commit();

            return {
                success: true,
                data: {
                    teacher_id: teacherId,
                    full_name: checkResult.rows[0].full_name,
                    deactivated: true,
                    deactivated_assignments: {
                        tutor_assignments: tutorResult.rowsAffected,
                        subject_assignments: assignmentResult.rowsAffected,
                        total_assignments: tutorResult.rowsAffected + assignmentResult.rowsAffected
                    },
                    summary: `Teacher and ${tutorResult.rowsAffected + assignmentResult.rowsAffected} associated assignments have been deactivated`
                },
                message: 'Teacher and all associated assignments deactivated successfully'
            };

        } catch (error) {
            console.error('Model: Error soft deleting teacher:', error);
            await client.rollback();
            return {
                success: false,
                error: error.message,
                code: 'DELETE_FAILED'
            };
        }
    },

    async getInactiveTeachers(institutionId, page = 1, limit = 10) {
        try {
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            const countQuery = `
                SELECT COUNT(*) as total
                FROM teachers
                WHERE institution_id = ? AND active = false
            `;

            const dataQuery = `
                SELECT
                    id, id_number,
                    first_name || ' ' || last_name AS full_name,
                    email, phone
                FROM 
                    teachers
                WHERE
                    institution_id = ? AND active = false
                ORDER BY last_name, first_name
                LIMIT ? OFFSET ?
            `;

            const [countResult, dataResult] = await Promise.all([
                turso.execute({
                    sql: countQuery,
                    args: [institutionId]
                }),
                turso.execute({
                    sql: dataQuery,
                    args: [institutionId, limitNum, offset]
                })
            ]);

            const total = countResult.rows[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum);

            if (dataResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'No teachers found for this institution',
                    code: 'NOT_FOUND'
                };
            }

            return {
                success: true,
                data: {
                    teachers: dataResult.rows,
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
            console.log('Model: Error finding teachers by institution:', error);
            return {
                success: false,
                error: error.message,
                code: 'FIND_FAILED'
            };
        }
    },

    async isTeacherActive(teacherId) {
        try {
            // Validación de entrada rápida
            if (!teacherId || teacherId <= 0) {
                return {
                    success: false,
                    error: 'Invalid teacher ID provided',
                    code: 'INVALID_INPUT'
                };
            }

            // Query optimizada solo para verificar existencia y estado
            const query = `
                SELECT 
                    id, 
                    active,
                    first_name || ' ' || last_name AS full_name
                FROM teachers
                WHERE id = ?
            `;

            const result = await turso.execute({
                sql: query,
                args: [teacherId]
            });

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Teacher not found',
                    code: 'NOT_FOUND'
                };
            }

            const teacher = result.rows[0];
            const isActive = Boolean(teacher.active);

            return {
                success: true,
                data: {
                    teacher_id: teacher.id,
                    full_name: teacher.full_name,
                    is_active: isActive,
                    status: isActive ? 'active' : 'inactive'
                }
            };

        } catch (error) {
            console.error('Model: Error checking teacher status:', error);
            return {
                success: false,
                error: 'Failed to check teacher status. Please try again.',
                code: 'DATABASE_ERROR'
            };
        }
    },

    async validateExcelData(institutionId, teachers) {
        try {
            const errors = [];
            const validTeachers = [];
            const duplicates = {
                internal: [], // Duplicados dentro del Excel
                database: []  // Duplicados con la base de datos
            };

            // Validar que haya datos
            if (!teachers || teachers.length === 0) {
                return {
                    success: false,
                    error: 'No teacher data found in Excel file',
                    code: 'NO_DATA'
                };
            }

            // Obtener emails y cédulas existentes en la base de datos
            const existingQuery = `
                SELECT id_number, email, first_name || ' ' || last_name as full_name
                FROM teachers 
                WHERE institution_id = ? AND active = 1
            `;

            const existingResult = await turso.execute({
                sql: existingQuery,
                args: [institutionId]
            });

            const existingIdNumbers = new Set(existingResult.rows.map(row => row.id_number));
            const existingEmails = new Set(existingResult.rows.map(row => row.email.toLowerCase()));

            // Arrays para detectar duplicados internos del Excel
            const excelIdNumbers = new Set();
            const excelEmails = new Set();

            // Validar cada profesor
            teachers.forEach((teacher, index) => {
                const row = index + 2; // +2 porque Excel empieza en 1 y hay header
                const rowErrors = [];

                // 1. Validar cédula (obligatorio, 10 dígitos, solo números)
                if (!teacher.cedula) {
                    rowErrors.push({
                        column: 'A',
                        field: 'cedula',
                        value: teacher.cedula || '',
                        error: 'Cédula es obligatoria',
                        suggestion: 'Ingrese una cédula de 10 dígitos (ej: 0804321370)'
                    });
                } else if (!/^\d{10}$/.test(teacher.cedula.toString())) {
                    rowErrors.push({
                        column: 'A',
                        field: 'cedula',
                        value: teacher.cedula,
                        error: 'Cédula debe tener exactamente 10 dígitos y solo números',
                        suggestion: 'Formato correcto: 0804321370 (10 dígitos sin espacios ni guiones)'
                    });
                } else {
                    // Validar duplicados internos
                    if (excelIdNumbers.has(teacher.cedula)) {
                        duplicates.internal.push({
                            row: row,
                            column: 'A',
                            field: 'cedula',
                            value: teacher.cedula,
                            error: 'Cédula duplicada en el archivo Excel'
                        });
                    } else {
                        excelIdNumbers.add(teacher.cedula);
                    }

                    // Validar duplicados con base de datos
                    if (existingIdNumbers.has(teacher.cedula)) {
                        duplicates.database.push({
                            row: row,
                            column: 'A',
                            field: 'cedula',
                            value: teacher.cedula,
                            error: 'Ya existe un profesor con esta cédula en la base de datos'
                        });
                    }
                }

                // 2. Validar nombres (obligatorio, solo letras y tildes)
                if (!teacher.nombres) {
                    rowErrors.push({
                        column: 'B',
                        field: 'nombres',
                        value: teacher.nombres || '',
                        error: 'Nombres es obligatorio',
                        suggestion: 'Ingrese el nombre del profesor'
                    });
                } else if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(teacher.nombres.trim())) {
                    rowErrors.push({
                        column: 'B',
                        field: 'nombres',
                        value: teacher.nombres,
                        error: 'Nombres solo puede contener letras, espacios y tildes',
                        suggestion: 'Retire números, símbolos o caracteres especiales'
                    });
                }

                // 3. Validar apellidos (obligatorio, solo letras y tildes)
                if (!teacher.apellidos) {
                    rowErrors.push({
                        column: 'C',
                        field: 'apellidos',
                        value: teacher.apellidos || '',
                        error: 'Apellidos es obligatorio',
                        suggestion: 'Ingrese los apellidos del profesor'
                    });
                } else if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(teacher.apellidos.trim())) {
                    rowErrors.push({
                        column: 'C',
                        field: 'apellidos',
                        value: teacher.apellidos,
                        error: 'Apellidos solo puede contener letras, espacios y tildes',
                        suggestion: 'Retire números, símbolos o caracteres especiales'
                    });
                }

                // 4. Validar email (obligatorio, formato válido)
                if (!teacher.email) {
                    rowErrors.push({
                        column: 'D',
                        field: 'email',
                        value: teacher.email || '',
                        error: 'Correo electrónico es obligatorio',
                        suggestion: 'Ingrese un email válido (ej: profesor@email.com)'
                    });
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(teacher.email.trim())) {
                        rowErrors.push({
                            column: 'D',
                            field: 'email',
                            value: teacher.email,
                            error: 'Formato de email inválido',
                            suggestion: 'Use el formato: usuario@dominio.com'
                        });
                    } else {
                        const emailLower = teacher.email.trim().toLowerCase();
                        
                        // Validar duplicados internos
                        if (excelEmails.has(emailLower)) {
                            duplicates.internal.push({
                                row: row,
                                column: 'D',
                                field: 'email',
                                value: teacher.email,
                                error: 'Email duplicado en el archivo Excel'
                            });
                        } else {
                            excelEmails.add(emailLower);
                        }

                        // Validar duplicados con base de datos
                        if (existingEmails.has(emailLower)) {
                            duplicates.database.push({
                                row: row,
                                column: 'D',
                                field: 'email',
                                value: teacher.email,
                                error: 'Ya existe un profesor con este email en la base de datos'
                            });
                        }
                    }
                }

                // 5. Validar teléfono (obligatorio, 10 dígitos, solo números)
                if (!teacher.telefono) {
                    rowErrors.push({
                        column: 'E',
                        field: 'telefono',
                        value: teacher.telefono || '',
                        error: 'Teléfono es obligatorio',
                        suggestion: 'Ingrese un teléfono de 10 dígitos (ej: 0983059930)'
                    });
                } else if (!/^\d{10}$/.test(teacher.telefono.toString())) {
                    rowErrors.push({
                        column: 'E',
                        field: 'telefono',
                        value: teacher.telefono,
                        error: 'Teléfono debe tener exactamente 10 dígitos y solo números',
                        suggestion: 'Formato correcto: 0983059930 (10 dígitos sin espacios)'
                    });
                }

                // 6. Validar convencional (opcional, si se proporciona debe ser válido)
                if (teacher.convencional && teacher.convencional.toString().trim() !== '') {
                    // No hay validación específica, pero podemos limpiar espacios
                    teacher.convencional = teacher.convencional.toString().trim();
                }

                if (rowErrors.length > 0) {
                    errors.push({
                        row: row,
                        errors: rowErrors
                    });
                } else {
                    // Si no hay errores en la fila, agregar a válidos
                    validTeachers.push({
                        ...teacher,
                        row: row,
                        nombres: teacher.nombres.trim(),
                        apellidos: teacher.apellidos.trim(),
                        email: teacher.email.trim().toLowerCase(),
                        telefono: teacher.telefono.toString(),
                        convencional: teacher.convencional ? teacher.convencional.toString().trim() : null
                    });
                }
            });

            // Compilar todos los errores
            const allErrors = [
                ...errors,
                ...duplicates.internal.map(dup => ({
                    row: dup.row,
                    errors: [{
                        column: dup.column,
                        field: dup.field,
                        value: dup.value,
                        error: dup.error,
                        suggestion: 'Verifique que no haya valores duplicados en el archivo'
                    }]
                })),
                ...duplicates.database.map(dup => ({
                    row: dup.row,
                    errors: [{
                        column: dup.column,
                        field: dup.field,
                        value: dup.value,
                        error: dup.error,
                        suggestion: 'Use una cédula/email diferente o actualice el registro existente'
                    }]
                }))
            ];

            return {
                success: allErrors.length === 0,
                data: {
                    totalRows: teachers.length,
                    validRows: validTeachers.length,
                    errorRows: allErrors.length,
                    errors: allErrors,
                    validTeachers: validTeachers,
                    summary: {
                        canImport: allErrors.length === 0,
                        duplicatesInExcel: duplicates.internal.length,
                        duplicatesInDatabase: duplicates.database.length,
                        validationErrors: errors.length
                    }
                },
                message: allErrors.length === 0 
                    ? `Validación exitosa: ${validTeachers.length} profesores listos para importar`
                    : `Se encontraron ${allErrors.length} errores en ${teachers.length} filas`
            };

        } catch (error) {
            console.error('Model: Error validating Excel data:', error);
            return {
                success: false,
                error: 'Failed to validate Excel data',
                code: 'VALIDATION_FAILED'
            };
        }
    },

    async importExcelTeachers(institutionId, validTeachers) {
        const client = await turso.transaction();
        try {
            const results = {
                imported: [],
                failed: [],
                total: validTeachers.length
            };

            const insertQuery = `
                INSERT INTO teachers(
                    institution_id, id_number, first_name, 
                    last_name, email, phone, phone_alt
                ) VALUES( ?, ?, ?, ?, ?, ?, ?)
            `;

            for (const teacher of validTeachers) {
                try {
                    const result = await client.execute({
                        sql: insertQuery,
                        args: [
                            institutionId,
                            teacher.cedula,
                            teacher.nombres,
                            teacher.apellidos,
                            teacher.email,
                            teacher.telefono,
                            teacher.convencional || null
                        ]
                    });

                    if (result.rowsAffected > 0) {
                        results.imported.push({
                            row: teacher.row,
                            id: Number(result.lastInsertRowid),
                            full_name: `${teacher.nombres} ${teacher.apellidos}`,
                            cedula: teacher.cedula,
                            email: teacher.email
                        });
                    } else {
                        results.failed.push({
                            row: teacher.row,
                            teacher: `${teacher.nombres} ${teacher.apellidos}`,
                            error: 'No rows were affected during insertion'
                        });
                    }
                } catch (insertError) {
                    console.error('Error inserting teacher:', insertError);
                    results.failed.push({
                        row: teacher.row,
                        teacher: `${teacher.nombres} ${teacher.apellidos}`,
                        error: insertError.message || 'Database insertion failed'
                    });
                }
            }

            if (results.failed.length > 0) {
                await client.rollback();
                return {
                    success: false,
                    error: `Failed to import ${results.failed.length} teachers`,
                    code: 'PARTIAL_IMPORT_FAILED',
                    data: results
                };
            }

            await client.commit();

            return {
                success: true,
                data: results,
                message: `Successfully imported ${results.imported.length} teachers`
            };

        } catch (error) {
            console.error('Model: Error importing Excel teachers:', error);
            await client.rollback();
            return {
                success: false,
                error: 'Failed to import teachers from Excel',
                code: 'IMPORT_FAILED'
            };
        }
    },
}