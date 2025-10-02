import { SubjectService } from "../services/sSubject";

export const SubjectController = {
    async create(req, res) {
        try {
            const result = await SubjectService.createSubject(req.body);

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
                message: "Subject created successfully"
            });
        } catch (error) {
            console.error("Error creating subject:", error);
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            });
        }
    },

    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await SubjectService.getAll(page, limit);
            if (!result.success) {
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
            console.error("Error fetching subjects:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            });
        }
    },

    async getDetailsById(req, res) {
        try {
            const subjectId = parseInt(req.params.subjectId, 10);

            const result = await SubjectService.getDetailsById(subjectId);
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
            console.error("Error fetching subject details:", error);
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            });
        }
    },

    async searchSubject(req, res) {
        try {
            const search = req.query.search;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await SubjectService.searchSubject(search, page, limit);
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
            console.error("Error searching subjects:", error);
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            });
        }
    },

    async updateSubject(req, res) {
        try {
            const data = req.body;

            const result = await SubjectService.updateSubject(data);

            if (!result.success) {
                let status = 400;
                if (result.code === "NOT_FOUND") status = 404;
                if (result.code === "SERVICE_ERROR") status = 500;
                if (result.code === "VALIDATION_ERROR") status = 400;
                if (result.code === "DUPLICATE_SUBJECT") status = 409; 
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
            console.error("Error updating subject:", error);
            return res.status(500).json({
                success: false,
                error: "Internal Server Error",
                code: "INTERNAL_SERVER_ERROR"
            });
        }
    }
};