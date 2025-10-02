import { ClassroomService } from "../services/sClassroom.js";

export const ClassroomController = {
    async createClassroom(req, res) {
        try {
            const result = await ClassroomService.createClassroom(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    code: result.code
                });
            }

            return res.status(201).json({
                success: true,
                data: result.data,
                message: "Classroom created successfully"
            });
        } catch (error) {
            console.error('Controller: Error creating classroom:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create classroom',
                code: 'SERVICE_ERROR'
            });
        }
    },

    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await ClassroomService.getAll(page, limit);
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
            console.error('Controller: Error fetching classrooms:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch classrooms',
                code: 'SERVICE_ERROR'
            });
        }
    },

    async getGrades(req, res) {
        try {
            const result = await ClassroomService.getGrades();
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: 'Grades retrieved successfully'
            });
        } catch (error) {
            console.error('Controller: Error fetching grades:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch grades',
                code: 'SERVICE_ERROR'
            });
        }
    },

    async getParallels(req, res) {
        try {
            const result = await ClassroomService.getParallels();
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }
            return res.status(200).json({
                success: true,
                data: result.data,
                message: 'Parallels retrieved successfully'
            });
        } catch (error) {
            console.error('Controller: Error fetching parallels:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch parallels',
                code: 'SERVICE_ERROR'
            });
        }
    },

    async getDetailsById(req, res) {
        try {
            const classroomId = parseInt(req.params.classroomId, 10);

            const result = await ClassroomService.getDetailsById(classroomId);
            if (!result.success) {
                let status = 400;
                if (result.code === 'NOT_FOUND_CLASSROOM') status = 404;
                if (result.code === 'SERVICE_ERROR') status = 500;

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
            console.error('Controller: Error fetching classroom details:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch classroom details',
                code: 'SERVICE_ERROR'
            });
        }
    },

    async searchClassroom(req, res) {
        try {
            const searchTerm = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await ClassroomService.searchClassroom(searchTerm.trim(), page, limit);
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
            console.error('Controller: Error searching classrooms:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to search classrooms',
                code: 'SERVICE_ERROR'
            });
        }
    },

    async updateClassroom(req, res) {
        try {
            const classroomId = parseInt(req.params.classroomId, 10);
            const data = req.body;

            const result = await ClassroomService.updateClassroom(classroomId, data);
            if (!result.success) {
                let status = 400;
                if (result.code === 'NOT_FOUND_CLASSROOM') status = 404;
                if (result.code === 'SERVICE_ERROR') status = 500;

                return res.status(status).json({
                    success: false,
                    error: result.error,
                    code: result.code
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: 'Classroom updated successfully'
            });
        } catch (error) {
            console.error('Controller: Error updating classroom:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update classroom',
                code: 'SERVICE_ERROR'
            });
        }
    }
};