import { TeacherModel } from "../models/mTeacher.js";
import { DateUtils } from "../utils/date.js";

export const TeacherService = {
    async createTeacher(data) {
        try {
            const requiredFields = ['institution_id', 'id_number', 'first_name', 'last_name', 'email', 'phone'];
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

            if (data.email && !this.isValidEmail(data.email)) {
                return {
                    success: false,
                    error: 'Please provide a valid email address',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (data.start_date) {
                const dateValidation = DateUtils.validateStartDate(data.start_date);
                if (!dateValidation.success) {
                    return {
                        success: false,
                        error: dateValidation.error,
                        code: dateValidation.code
                    };
                }
            }

            if (data.classroom_id && !data.academic_year_id) {
                return {
                    success: false,
                    error: 'Academic year ID is required when assigning classroom tutor',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (data.course_subject_id && !data.academic_year_id) {
                return {
                    success: false,
                    error: 'Academic year ID is required when assigning course subject',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.create(data);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            let message = 'Teacher created successfully';
            if (result.data.classroom_tutor_assigned && result.data.subject_assigned) {
                message += ' with classroom tutor and subject assignments';
            } else if (result.data.classroom_tutor_assigned) {
                message += ' with classroom tutor assignment';
            } else if (result.data.subject_assigned) {
                message += ' with subject assignment';
            }

            return {
                success: true,
                data: result.data,
                message: message
            };
        } catch (error) {
            console.log('Service: Error creating teacher:', error);
            return {
                success: false,
                error: 'Failed to create teacher',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getAllByInstitution(institutionId, page = 1, limit = 10) {
        try {
            if (!institutionId || isNaN(institutionId) || institutionId <= 0) {
                return {
                    success: false,
                    error: 'Invalid institution ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await TeacherModel.getTeacherByInstitution(institutionId, pageNum, limitNum);

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
                message: `Found ${result.data.pagination.totalItems} teachers (page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages})`
            };
        } catch (error) {
            console.log('Service: Error getting teachers by institution:', error);
            return {
                success: false,
                error: 'Failed to get teachers by institution',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async searchTeacher(institutionId, searchTerm, page = 1, limit = 10) {
        try {
            if (!institutionId || isNaN(institutionId) || institutionId <= 0) {
                return {
                    success: false,
                    error: 'Invalid institution ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
                return {
                    success: false,
                    error: 'Search term is required',
                    code: 'VALIDATION_ERROR'
                };
            }


            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

            const result = await TeacherModel.searchTeacher(institutionId, searchTerm, pageNum, limitNum);

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
                message: `Found ${result.data.pagination.totalItems} teachers (page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages})`
            };
        } catch (error) {
            console.log('Service: Error searching teachers:', error);
            return {
                success: false,
                error: 'Failed to search teachers',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getTeacherDetails(teacherId, { includeInactive = false } = {}) {
        try {
            if (!teacherId || isNaN(teacherId) || teacherId <= 0) {
                return {
                    success: false,
                    error: 'Invalid teacher ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.getDetailsById(teacherId, { includeInactive });

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
                message: 'Teacher details retrieved successfully'
            };
        } catch (error) {
            console.log('Service: Error getting teacher details:', error);
            return {
                success: false,
                error: 'Failed to get teacher details',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getClassrooms(institutionId) {
        try {
            if (!institutionId || isNaN(institutionId) || institutionId <= 0) {
                return {
                    success: false,
                    error: 'Invalid institution ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.getClassrooms(institutionId);

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
                message: 'Classrooms retrieved successfully'
            };
        } catch (error) {
            console.log('Service: Error getting classrooms:', error);
            return {
                success: false,
                error: 'Failed to get classrooms',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async assignTutorToCourse(data) {
        try {
            const { classroom_id, teacher_id } = data;
            if (!classroom_id || isNaN(classroom_id) || classroom_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid classroom ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (!teacher_id || isNaN(teacher_id) || teacher_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid teacher ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (data.start_date && data.end_date) {
                const dateValidation = DateUtils.validateDateRange(data.start_date, data.end_date);
                if (!dateValidation) {
                    return {
                        success: false,
                        error: 'Invalid date range',
                        code: 'VALIDATION_ERROR'
                    };
                }
            }

            const result = await TeacherModel.assignTutorToCourse(data);
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
                message: 'Tutor assigned to course successfully'
            };
        } catch (error) {
            console.log('Service: Error assigning tutor to course:', error);
            return {
                success: false,
                error: 'Failed to assign tutor to course',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getCourseSubjects(institutionId) {
        try {
            if (!institutionId || isNaN(institutionId) || institutionId <= 0) {
                return {
                    success: false,
                    error: 'Invalid institution ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.getCourseSubjects(institutionId);

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
                message: 'Course subjects retrieved successfully'
            };
        } catch (error) {
            console.log('Service: Error getting course subjects:', error);
            return {
                success: false,
                error: 'Failed to get course subjects',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async assignToCourse(data) {
        try {
            const { teacher_id, course_subject_id } = data;

            if (!teacher_id || isNaN(teacher_id) || teacher_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid teacher ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (!course_subject_id || isNaN(course_subject_id) || course_subject_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid course subject ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.assignToCourse(data);

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
                message: 'Teacher assigned to course successfully'
            };
        } catch (error) {
            console.log('Service: Error assigning teacher to course:', error);
            return {
                success: false,
                error: 'Failed to assign teacher to course',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async deleteAssignmentTutor(classroomTutorId) {
        try {
            if (!classroomTutorId || isNaN(classroomTutorId) || classroomTutorId <= 0) {
                return {
                    success: false,
                    error: 'Invalid classroom tutor ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.deleteAssignmentTutor(classroomTutorId);

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
                message: 'Tutor assignment deleted successfully'
            };
        } catch (error) {
            console.log('Service: Error deleting tutor assignment:', error);
            return {
                success: false,
                error: 'Failed to delete tutor assignment',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async updateClassroomTutor(data) {
        try {
            const { classroom_tutor_id, classroom_id, start_date, end_date, notes } = data;

            // Validación del ID (campo requerido)
            if (!classroom_tutor_id || classroom_tutor_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid classroom tutor ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Preparar datos para actualización (solo los campos que se enviaron)
            const updateData = {};

            // Solo incluir campos que están definidos (undefined significa que no se envió)
            if (classroom_id !== undefined) {
                updateData.classroom_id = classroom_id;
            }

            if (start_date !== undefined) {
                updateData.start_date = start_date;
            }

            if (end_date !== undefined) {
                updateData.end_date = end_date;
            }

            if (notes !== undefined) {
                updateData.notes = notes;
            }

            // Validar que hay al menos un campo para actualizar
            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: 'No fields to update. Please provide at least one field to update.',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Validar fechas si ambas están presentes y no son null
            if (updateData.start_date != null && updateData.end_date != null) {
                const dateValidation = DateUtils.validateDateRange(updateData.start_date, updateData.end_date);

                if (!dateValidation || (typeof dateValidation === 'object' && !dateValidation.success)) {
                    return {
                        success: false,
                        error: dateValidation?.error || 'Invalid date range',
                        code: 'VALIDATION_ERROR'
                    };
                }
            }

            // Validar classroom_id si se proporciona
            if (updateData.classroom_id !== undefined && updateData.classroom_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid classroom ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.updateClassroomTutor(classroom_tutor_id, updateData);

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
                    ? `Classroom tutor updated successfully. ${result.data.updatedFields} field(s) modified.`
                    : 'No changes were needed.'
            };

        } catch (error) {
            console.error('Service: Error updating classroom tutor:', error.message);
            return {
                success: false,
                error: 'Failed to update classroom tutor',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async updateCourseAssignment(data) {
        try {
            const { assignment_id, course_subject_id, start_date, end_date, notes } = data;

            if (!assignment_id || assignment_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid assignment ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const updateData = {};

            if (course_subject_id !== undefined) {
                updateData.course_subject_id = course_subject_id;
            }

            if (start_date !== undefined) {
                updateData.start_date = start_date;
            }

            if (end_date !== undefined) {
                updateData.end_date = end_date;
            }

            if (notes !== undefined) {
                updateData.notes = notes;
            }

            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: 'No fields to update. Please provide at least one field to update.',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (updateData.start_date != null && updateData.end_date != null) {
                const dateValidation = DateUtils.validateDateRange(updateData.start_date, updateData.end_date);

                if (!dateValidation || (typeof dateValidation === 'object' && !dateValidation.success)) {
                    return {
                        success: false,
                        error: dateValidation?.error || 'Invalid date range',
                        code: 'VALIDATION_ERROR'
                    };
                }
            }

            if (updateData.course_subject_id !== undefined && updateData.course_subject_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid course subject ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.updateCourseAssignment(assignment_id, updateData);

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
                    ? `Teacher assignment updated successfully. ${result.data.updatedFields} field(s) modified.`
                    : 'No changes were needed.'
            };

        } catch (error) {
            console.error('Service: Error updating course assignment:', error.message);
            return {
                success: false,
                error: 'Failed to update course assignment',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async deleteAssignment(assignmentId) {
        try {
            if (!assignmentId || assignmentId <= 0) {
                return {
                    success: false,
                    error: 'Invalid assignment ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.deleteAssignment(assignmentId);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            return {
                success: true,
                message: 'Teacher assignment deleted successfully.'
            };

        } catch (error) {
            console.error('Service: Error deleting course assignment:', error.message);
            return {
                success: false,
                error: 'Failed to delete course assignment',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async updateTeacher(data) {
        try {
            const { teacher_id, id_number, first_name, last_name, email, phone, phone_alt, active } = data;

            if (!teacher_id || teacher_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid teacher ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            const updateData = {};

            if (id_number !== undefined) {
                if (id_number && (typeof id_number !== 'string' || id_number.trim().length === 0)) {
                    return {
                        success: false,
                        error: 'ID number must be a non-empty string',
                        code: 'VALIDATION_ERROR'
                    };
                }
                updateData.id_number = id_number ? id_number.trim() : id_number;
            }

            if (first_name !== undefined) {
                if (first_name && (typeof first_name !== 'string' || first_name.trim().length === 0)) {
                    return {
                        success: false,
                        error: 'First name must be a non-empty string',
                        code: 'VALIDATION_ERROR'
                    };
                }
                updateData.first_name = first_name ? first_name.trim() : first_name;
            }

            if (last_name !== undefined) {
                if (last_name && (typeof last_name !== 'string' || last_name.trim().length === 0)) {
                    return {
                        success: false,
                        error: 'Last name must be a non-empty string',
                        code: 'VALIDATION_ERROR'
                    };
                }
                updateData.last_name = last_name ? last_name.trim() : last_name;
            }

            if (email !== undefined) {
                if (email && (typeof email !== 'string' || !this.isValidEmail(email))) {
                    return {
                        success: false,
                        error: 'Please provide a valid email address',
                        code: 'VALIDATION_ERROR'
                    };
                }
                updateData.email = email ? email.trim().toLowerCase() : email;
            }

            if (phone !== undefined) {
                updateData.phone = phone;
            }

            if (phone_alt !== undefined) {
                updateData.phone_alt = phone_alt;
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
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.updateTeacher(teacher_id, updateData);

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
                    ? `Teacher updated successfully. ${result.data.updatedFields} field(s) modified.`
                    : 'No changes were needed.'
            };

        } catch (error) {
            console.error('Service: Error updating teacher:', error.message);
            return {
                success: false,
                error: 'Failed to update teacher',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getOnlyInfoTeachers(teacherId) {
        try {
            if (!teacherId) {
                return {
                    success: false,
                    error: 'Teacher ID is required',
                    code: 'VALIDATION_ERROR'
                };
            }

            const numericTeacherId = parseInt(teacherId, 10);
            if (isNaN(numericTeacherId) || numericTeacherId <= 0) {
                return {
                    success: false,
                    error: 'Teacher ID must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                };
            }

            const result = await TeacherModel.getOnlyInfoTeachers(numericTeacherId);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            const teacherData = result.data;
            const processedData = {
                ...teacherData,
                created_at_formatted: teacherData.created_at ?
                    new Date(teacherData.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : null,
                status: teacherData.active ? 'Active' : 'Inactive',
                contact_info: {
                    has_email: !!teacherData.email,
                    has_primary_phone: !!teacherData.phone,
                    has_alternative_phone: !!teacherData.phone_alt,
                    total_contact_methods:
                        (teacherData.email ? 1 : 0) +
                        (teacherData.phone ? 1 : 0) +
                        (teacherData.phone_alt ? 1 : 0)
                }
            };

            return {
                success: true,
                data: processedData,
                message: 'Teacher information retrieved successfully'
            };

        } catch (error) {
            console.error('Service: Error getting teacher info:', error.message);
            return {
                success: false,
                error: 'Failed to retrieve teacher information',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async softDeleteTeacher(teacherId) {
        try {
            // Validación de entrada
            if (!teacherId) {
                return {
                    success: false,
                    error: 'Teacher ID is required',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Validar que sea un número válido
            const numericTeacherId = parseInt(teacherId, 10);
            if (isNaN(numericTeacherId) || numericTeacherId <= 0) {
                return {
                    success: false,
                    error: 'Teacher ID must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Llamar al modelo
            const result = await TeacherModel.softDeleteTeacher(numericTeacherId);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            return {
                success: true,
                data: { teacher_id: numericTeacherId, deactivated: true },
                message: 'Teacher has been successfully deactivated'
            };

        } catch (error) {
            console.error('Service: Error deactivating teacher:', error.message);
            return {
                success: false,
                error: 'Failed to deactivate teacher',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async getInactiveTeachers(institutionId, page = 1, limit = 10) {
        try {
            // Validación de entrada
            if (!institutionId) {
                return {
                    success: false,
                    error: 'Institution ID is required',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Validar que sea un número válido
            const numericInstitutionId = parseInt(institutionId, 10);
            if (isNaN(numericInstitutionId) || numericInstitutionId <= 0) {
                return {
                    success: false,
                    error: 'Institution ID must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Validar parámetros de paginación
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

            // Llamar al modelo
            const result = await TeacherModel.getInactiveTeachers(numericInstitutionId, pageNum, limitNum);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            // Procesar datos para mejor presentación
            const processedData = {
                ...result.data,
                summary: {
                    total_inactive_teachers: result.data.pagination.totalItems,
                    showing: result.data.teachers.length,
                    current_page: result.data.pagination.currentPage,
                    total_pages: result.data.pagination.totalPages
                }
            };

            return {
                success: true,
                data: processedData,
                message: `Found ${result.data.pagination.totalItems} inactive teacher(s) for this institution`
            };

        } catch (error) {
            console.error('Service: Error getting inactive teachers:', error.message);
            return {
                success: false,
                error: 'Failed to retrieve inactive teachers',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async isTeacherActive(teacherId) {
        try {
            // Validación de entrada
            if (!teacherId) {
                return {
                    success: false,
                    error: 'Teacher ID is required',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Validar que sea un número válido
            const numericTeacherId = parseInt(teacherId, 10);
            if (isNaN(numericTeacherId) || numericTeacherId <= 0) {
                return {
                    success: false,
                    error: 'Teacher ID must be a valid positive number',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Llamar al modelo
            const result = await TeacherModel.isTeacherActive(numericTeacherId);

            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    code: result.code
                };
            }

            // Retornar resultado optimizado
            return {
                success: true,
                data: result.data,
                message: `Teacher is ${result.data.status}`
            };

        } catch (error) {
            console.error('Service: Error checking teacher status:', error.message);
            return {
                success: false,
                error: 'Failed to check teacher status',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async validateExcelFile(institutionId, fileBuffer) {
        try {
            // Importar xlsx dinámicamente
            const XLSX = await import('xlsx');

            // Validar que se proporcione el archivo
            if (!fileBuffer) {
                return {
                    success: false,
                    error: 'No file provided',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Validar institution_id
            if (!institutionId || isNaN(institutionId) || institutionId <= 0) {
                return {
                    success: false,
                    error: 'Invalid institution ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Leer el archivo Excel
            let workbook;
            try {
                workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            } catch (xlsxError) {
                return {
                    success: false,
                    error: 'Invalid Excel file format',
                    code: 'INVALID_FILE_FORMAT'
                };
            }

            // Obtener la primera hoja
            const sheetNames = workbook.SheetNames;
            if (sheetNames.length === 0) {
                return {
                    success: false,
                    error: 'Excel file contains no sheets',
                    code: 'NO_SHEETS'
                };
            }

            const worksheet = workbook.Sheets[sheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Verificar que hay datos
            if (jsonData.length < 2) {
                return {
                    success: false,
                    error: 'Excel file must contain at least a header row and one data row',
                    code: 'INSUFFICIENT_DATA'
                };
            }

            // Verificar estructura de columnas
            const expectedHeaders = ['cédula', 'nombres', 'apellidos', 'correo electrónico', 'teléfono', 'convencional'];
            const actualHeaders = jsonData[0].map(header => header ? header.toString().toLowerCase().trim() : '');

            const headerErrors = [];
            expectedHeaders.forEach((expected, index) => {
                const actual = actualHeaders[index] || '';
                if (actual !== expected) {
                    headerErrors.push({
                        column: String.fromCharCode(65 + index), // A, B, C, etc.
                        expected: expected,
                        actual: actual,
                        error: `Columna ${String.fromCharCode(65 + index)} debe ser "${expected}"`
                    });
                }
            });

            if (headerErrors.length > 0) {
                return {
                    success: false,
                    error: 'Invalid Excel column structure',
                    code: 'INVALID_HEADERS',
                    data: {
                        headerErrors: headerErrors,
                        suggestion: 'Las columnas deben estar en este orden: Cédula, Nombres, Apellidos, Correo Electrónico, Teléfono, Convencional'
                    }
                };
            }

            // Convertir datos a objetos
            const teachers = jsonData.slice(1).map((row, index) => {
                // Filtrar filas completamente vacías
                if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
                    return null;
                }

                return {
                    cedula: row[0] ? row[0].toString().trim() : '',
                    nombres: row[1] ? row[1].toString().trim() : '',
                    apellidos: row[2] ? row[2].toString().trim() : '',
                    email: row[3] ? row[3].toString().trim() : '',
                    telefono: row[4] ? row[4].toString().trim() : '',
                    convencional: row[5] ? row[5].toString().trim() : null
                };
            }).filter(teacher => teacher !== null); // Remover filas vacías

            if (teachers.length === 0) {
                return {
                    success: false,
                    error: 'No valid teacher data found in Excel file',
                    code: 'NO_VALID_DATA'
                };
            }

            // Validar datos usando el modelo
            const validationResult = await TeacherModel.validateExcelData(institutionId, teachers);

            return validationResult;

        } catch (error) {
            console.error('Service: Error validating Excel file:', error.message);
            return {
                success: false,
                error: 'Failed to validate Excel file',
                code: 'SERVICE_ERROR'
            };
        }
    },

    async importValidatedTeachers(institutionId, validTeachers) {
        try {
            // Validaciones de entrada
            if (!institutionId || isNaN(institutionId) || institutionId <= 0) {
                return {
                    success: false,
                    error: 'Invalid institution ID',
                    code: 'VALIDATION_ERROR'
                };
            }

            if (!validTeachers || !Array.isArray(validTeachers) || validTeachers.length === 0) {
                return {
                    success: false,
                    error: 'No valid teachers provided for import',
                    code: 'VALIDATION_ERROR'
                };
            }

            // Llamar al modelo para importar
            const importResult = await TeacherModel.importExcelTeachers(institutionId, validTeachers);

            if (!importResult.success) {
                return {
                    success: false,
                    error: importResult.error,
                    code: importResult.code,
                    data: importResult.data
                };
            }

            return {
                success: true,
                data: importResult.data,
                message: `Successfully imported ${importResult.data.imported.length} teachers from Excel file`
            };

        } catch (error) {
            console.error('Service: Error importing validated teachers:', error.message);
            return {
                success: false,
                error: 'Failed to import teachers',
                code: 'SERVICE_ERROR'
            };
        }
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}