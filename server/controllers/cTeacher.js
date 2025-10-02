import { TeacherService } from "../services/sTeacher.js";

export const TeacherController = {
    async createTeacher(req, res) {
        try {
            const result = await TeacherService.createTeacher(req.body);

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
                message: 'Teacher created successfully'
            });
        } catch (error) {
            console.error('Controller: Unexpected error creating teacher:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getAllByInstitution(req, res) {
        try {
            const institutionId = parseInt(req.params.institutionId, 10);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await TeacherService.getAllByInstitution(institutionId, page, limit);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error getting teachers by institution:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async searchTeacher(req, res) {
        try {
            const institutionId = parseInt(req.params.institutionId, 10);
            const search = req.query.search
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await TeacherService.searchTeacher(institutionId, search, page, limit);
            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error searching teachers:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getTeacherDetails(req, res) {
        try {
            const teacherId = parseInt(req.params.teacherId, 10);
            const includeInactive = req.query.includeInactive === 'true';

            const result = await TeacherService.getTeacherDetails(teacherId, { includeInactive });

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error getting teacher details:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getClassrooms(req, res) {
        try {
            const institutionId = parseInt(req.params.institutionId, 10);

            const result = await TeacherService.getClassrooms(institutionId);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error getting classrooms:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async assignTutorToCourse(req, res) {
        try {

            const data = req.body;

            const institutionId = parseInt(req.body.classroom_id, 10);
            const teacherId = parseInt(req.body.teacher_id, 10);

            const result = await TeacherService.assignTutorToCourse({
                institutionId,
                teacherId,
                ...data
            });
            console.log('Controller: Error assigning tutor to course:', result);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error assigning tutor to course:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getCourseSubjects(req, res) {
        try {
            const institutionId = parseInt(req.params.institutionId, 10);

            const result = await TeacherService.getCourseSubjects(institutionId);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error getting course subjects:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async assignToCourse(req, res) {
        try {
            const data = req.body;

            const result = await TeacherService.assignToCourse(data);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error assigning teacher to course:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async deleteAssignmentTutor(req, res) {
        try {
            const assignmentId = parseInt(req.params.assignmentId, 10);

            const result = await TeacherService.deleteAssignmentTutor(assignmentId);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error deleting tutor assignment:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async updateClassroomTutor(req, res) {
        try {
            const data = req.body;

            if (!data || typeof data !== 'object') {
                return res.status(400).json({
                    success: false,
                    error: 'Request body is required and must be an object',
                    code: 'VALIDATION_ERROR'
                });
            }

            if (!data.classroom_tutor_id) {
                return res.status(400).json({
                    success: false,
                    error: 'classroom_tutor_id is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            if (isNaN(data.classroom_tutor_id) || data.classroom_tutor_id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'classroom_tutor_id must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                });
            }

            data.classroom_tutor_id = parseInt(data.classroom_tutor_id, 10);

            const result = await TeacherService.updateClassroomTutor(data);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "VALIDATION_ERROR") status = 400;
                if (result.code === "CLASSROOM_ALREADY_HAS_TUTOR") status = 409;
                if (result.code === "CONSTRAINT_VIOLATION") status = 400;
                if (result.code === "UPDATE_FAILED") status = 500;

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
            console.error('Controller: Unexpected error updating classroom tutor:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async updateCourseAssignment(req, res) {
        try {
            const data = req.body;

            if (!data || typeof data !== 'object') {
                return res.status(400).json({
                    success: false,
                    error: 'Request body is required and must be an object',
                    code: 'VALIDATION_ERROR'
                });
            }

            if (!data.assignment_id) {
                return res.status(400).json({
                    success: false,
                    error: 'assignment_id is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            if (isNaN(data.assignment_id) || data.assignment_id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'assignment_id must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                });
            }

            data.assignment_id = parseInt(data.assignment_id, 10);

            const result = await TeacherService.updateCourseAssignment(data);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "VALIDATION_ERROR") status = 400;
                if (result.code === "TEACHER_ALREADY_ASSIGNED") status = 409;
                if (result.code === "CONSTRAINT_VIOLATION") status = 400;
                if (result.code === "UPDATE_FAILED") status = 500;

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
            console.error('Controller: Unexpected error updating course assignment:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async deleteAssignment(req, res) {
        try {
            const assignmentId = parseInt(req.params.assignmentId, 10);

            const result = await TeacherService.deleteAssignment(assignmentId);
            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;
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
            console.error('Controller: Unexpected error deleting assignment:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async updateTeacher(req, res) {
        try {
            const data = req.body;

            // Validación básica de entrada
            if (!data || typeof data !== 'object') {
                return res.status(400).json({
                    success: false,
                    error: 'Request body is required and must be an object',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validar que se proporcione el ID del profesor
            if (!data.teacher_id) {
                return res.status(400).json({
                    success: false,
                    error: 'teacher_id is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validar que el ID sea un número válido
            if (isNaN(data.teacher_id) || data.teacher_id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'teacher_id must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Convertir a número para asegurar el tipo correcto
            data.teacher_id = parseInt(data.teacher_id, 10);

            const result = await TeacherService.updateTeacher(data);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "VALIDATION_ERROR") status = 400;
                if (result.code === "DUPLICATE_TEACHER") status = 409; // Conflict
                if (result.code === "EMAIL_ALREADY_EXISTS") status = 409; // Conflict
                if (result.code === "ID_NUMBER_ALREADY_EXISTS") status = 409; // Conflict
                if (result.code === "CONSTRAINT_VIOLATION") status = 400;
                if (result.code === "UPDATE_FAILED") status = 500;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            // Retornar con código 200 (OK) para updates exitosos
            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Unexpected error updating teacher:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getOnlyInfoTeachers(req, res) {
        try {
            const { teacherId } = req.params;

            // Validación de parámetros de ruta
            if (!teacherId) {
                return res.status(400).json({
                    success: false,
                    error: 'Teacher ID is required in the URL path',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validación adicional del formato
            if (isNaN(teacherId) || parseInt(teacherId, 10) <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Teacher ID must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                });
            }

            const result = await TeacherService.getOnlyInfoTeachers(teacherId);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "TEACHER_INACTIVE") status = 410; // Gone - resource exists but unavailable
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "DATABASE_ERROR") status = 500;
                if (result.code === "VALIDATION_ERROR") status = 400;
                if (result.code === "INVALID_INPUT") status = 400;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            // Agregar cache headers para mejorar rendimiento
            res.set({
                'Cache-Control': 'public, max-age=300', // 5 minutos
                'ETag': `"teacher-${teacherId}-${Date.now()}"`,
                'Last-Modified': new Date().toUTCString()
            });

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Unexpected error getting teacher info:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error while retrieving teacher information',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async softDeleteTeacher(req, res) {
        try {
            const { teacherId } = req.params;

            // Validación de parámetros
            if (!teacherId) {
                return res.status(400).json({
                    success: false,
                    error: 'Teacher ID parameter is required',
                    code: 'MISSING_PARAMETER'
                });
            }

            // Llamar al servicio
            const result = await TeacherService.softDeleteTeacher(teacherId);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

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
            console.error('Controller: Unexpected error deactivating teacher:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error while deactivating teacher',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async getInactiveTeachers(req, res) {
        try {
            const { institutionId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Validación de parámetros
            if (!institutionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Institution ID parameter is required',
                    code: 'MISSING_PARAMETER'
                });
            }

            // Llamar al servicio
            const result = await TeacherService.getInactiveTeachers(institutionId, page, limit);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            // Añadir headers para paginación
            res.set({
                'Cache-Control': 'public, max-age=60', // 1 minuto para datos de inactivos
                'X-Total-Count': result.data.pagination.totalItems,
                'X-Page': result.data.pagination.currentPage,
                'X-Per-Page': result.data.pagination.limit,
                'X-Total-Pages': result.data.pagination.totalPages
            });

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Unexpected error getting inactive teachers:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error while retrieving inactive teachers',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async isTeacherActive(req, res) {
        try {
            const { teacherId } = req.params;

            // Validación de parámetros
            if (!teacherId) {
                return res.status(400).json({
                    success: false,
                    error: 'Teacher ID parameter is required',
                    code: 'MISSING_PARAMETER'
                });
            }

            // Llamar al servicio
            const result = await TeacherService.isTeacherActive(teacherId);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            // Headers optimizados para consulta rápida
            res.set({
                'Cache-Control': 'public, max-age=120', // 2 minutos
                'ETag': `"teacher-status-${teacherId}-${result.data.is_active}"`
            });

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Unexpected error checking teacher status:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error while checking teacher status',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async validateExcelFile(req, res) {
        try {
            const { institutionId } = req.params;

            // Validación de parámetros
            if (!institutionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Institution ID parameter is required',
                    code: 'MISSING_PARAMETER'
                });
            }

            // Validación de archivo
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Excel file is required',
                    code: 'MISSING_FILE'
                });
            }

            // Validar tipo de archivo
            if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
                req.file.mimetype !== 'application/vnd.ms-excel') {
                return res.status(400).json({
                    success: false,
                    error: 'File must be an Excel file (.xlsx or .xls)',
                    code: 'INVALID_FILE_TYPE'
                });
            }

            // Llamar al servicio
            const result = await TeacherService.validateExcelFile(
                parseInt(institutionId, 10),
                req.file.buffer
            );

            if (!result.success) {
                let status = 400;
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "NOT_FOUND") status = 404;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code,
                    data: result.data || null
                });
            }

            // Respuesta de validación exitosa
            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Unexpected error validating Excel file:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error while validating Excel file',
                code: 'CONTROLLER_ERROR'
            });
        }
    },

    async importTeachersFromExcel(req, res) {
        try {
            const { institutionId } = req.params;
            const { validTeachers } = req.body;

            // Validación de parámetros
            if (!institutionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Institution ID parameter is required',
                    code: 'MISSING_PARAMETER'
                });
            }

            if (!validTeachers || !Array.isArray(validTeachers) || validTeachers.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid teachers data is required for import',
                    code: 'MISSING_DATA'
                });
            }

            // Llamar al servicio
            const result = await TeacherService.importValidatedTeachers(
                parseInt(institutionId, 10),
                validTeachers
            );

            if (!result.success) {
                let status = 400;
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "PARTIAL_IMPORT_FAILED") status = 207; // Multi-Status

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code,
                    data: result.data || null
                });
            }

            // Respuesta de importación exitosa
            return res.status(201).json({
                success: true,
                data: result.data,
                message: result.message
            });

        } catch (error) {
            console.error('Controller: Unexpected error importing teachers from Excel:', error);
            return res.status(500).json({
                success: false,
                error: 'Unexpected server error while importing teachers',
                code: 'CONTROLLER_ERROR'
            });
        }
    },
};
