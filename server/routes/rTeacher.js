import express from 'express';
import multer from 'multer';
import { TeacherController } from '../controllers/cTeacher.js';

// Configurar multer para manejar archivos Excel
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo archivos Excel
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
        }
    }
});

const router = express.Router();

router.post('/', TeacherController.createTeacher);
router.post('/assign-tutor', TeacherController.assignTutorToCourse);
router.post('/assign/course-subject', TeacherController.assignToCourse);

// Rutas para Excel import
router.post('/excel/validate/:institutionId', upload.single('excel'), TeacherController.validateExcelFile);
router.post('/excel/import/:institutionId', TeacherController.importTeachersFromExcel);

// Query parameters: ?page=1&limit=10
router.get("/institution/:institutionId", TeacherController.getAllByInstitution);
router.get("/info/:teacherId", TeacherController.getOnlyInfoTeachers);
router.get("/:institutionId", TeacherController.searchTeacher);
router.get("/details/:teacherId", TeacherController.getTeacherDetails);
router.get("/classrooms/:institutionId", TeacherController.getClassrooms);
router.get("/course-subjects/:institutionId", TeacherController.getCourseSubjects);

router.get("/inactive/:institutionId", TeacherController.getInactiveTeachers);
router.get("/status/:teacherId", TeacherController.isTeacherActive);

router.delete("/assign-tutor/:assignmentId", TeacherController.deleteAssignmentTutor);
router.delete("/assign/course-subject/:assignmentId", TeacherController.deleteAssignment);

router.patch("/deactivate/:teacherId", TeacherController.softDeleteTeacher);

router.put("/assign-tutor", TeacherController.updateClassroomTutor);
router.put("/assign/course-subject/", TeacherController.updateCourseAssignment);
router.put("/", TeacherController.updateTeacher);

export default router;