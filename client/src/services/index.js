import { TeacherService } from "./api/teacher";
import { SubjectService } from "./api/subject";
import { ClassroomService } from "./api/classroom";
import * as AssignmentService from "./api/assignment";

const apiServices = {
    teachers: TeacherService,
    subjects: SubjectService,
    classrooms: ClassroomService,
    assignments: AssignmentService
};

export default apiServices;