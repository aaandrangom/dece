PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS institutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    district TEXT,
    amie_code TEXT UNIQUE,
    circuit TEXT,
    canton TEXT,
    parish TEXT,
    province TEXT,
    neighborhood TEXT,
    active BOOLEAN DEFAULT 1
);
INSERT INTO institutions VALUES(1,'Unidad Educativa San José','Quinindé','08H00123','C01','Quinindé','Quinindé','Esmeraldas',NULL,1);
CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_code TEXT UNIQUE NOT NULL,     -- "2024-2025", "2025-2026"
    year_name TEXT NOT NULL,            -- "Año Lectivo 2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_year BOOLEAN DEFAULT 0,     -- Solo un año puede ser el actual
    active BOOLEAN DEFAULT 1
);
INSERT INTO academic_years VALUES(1,'2023-2024','Año Lectivo 2023-2024','2023-09-01','2024-07-31',0,1);
INSERT INTO academic_years VALUES(2,'2024-2025','Año Lectivo 2024-2025','2024-09-01','2025-07-31',1,1);
INSERT INTO academic_years VALUES(3,'2025-2026','Año Lectivo 2025-2026','2025-09-01','2026-07-31',0,1);
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    id_number TEXT UNIQUE NOT NULL,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    email TEXT,
    birth_date DATE,
    age INTEGER,
    nationality TEXT,
    foreign_student BOOLEAN DEFAULT 0,
    country_origin TEXT,
    passport_dni TEXT,
    blood_type TEXT,
    weight REAL,
    height REAL,
    address TEXT,
    map_file TEXT,
    phone TEXT,
    phone_alt TEXT,
    province_origin TEXT,
    canton_origin TEXT,
    parents_together BOOLEAN,
    photo TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
CREATE TABLE IF NOT EXISTS guardians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('FATHER','MOTHER','LEGAL_REPRESENTATIVE')) NOT NULL,
    id_number TEXT,
    first_name TEXT,
    last_name TEXT,
    birth_date DATE,
    age INTEGER,
    education TEXT,
    profession TEXT,
    workplace TEXT,
    phone TEXT,
    phone_alt TEXT,
    relationship TEXT,
    legal_document TEXT,
    lives_with_student BOOLEAN DEFAULT 1,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
CREATE TABLE IF NOT EXISTS authorities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    id_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    id_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('DECE', 'ADMIN')) DEFAULT 'DECE',
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT 1
);
INSERT INTO subjects VALUES(1,'Matemáticas','MAT',NULL,1);
INSERT INTO subjects VALUES(2,'Lengua y Literatura','LEN',NULL,1);
INSERT INTO subjects VALUES(3,'Ciencias Naturales','CCN',NULL,1);
INSERT INTO subjects VALUES(4,'Estudios Sociales','EES',NULL,1);
INSERT INTO subjects VALUES(5,'Inglés','ING',NULL,1);
INSERT INTO subjects VALUES(6,'Educación Física','EDF',NULL,1);
INSERT INTO subjects VALUES(7,'Educación Cultural y Artística','ECA',NULL,1);
CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    name_short TEXT NOT NULL,              -- "8vo", "9no", "10mo", "1ro BGU"
    name_full TEXT NOT NULL,               -- "OCTAVO AÑO DE EDUCACIÓN BÁSICA GENERAL"
    level TEXT NOT NULL,                   -- "EGB", "BGU", "INICIAL"
    order_number INTEGER NOT NULL,         -- Para ordenamiento: 8, 9, 10, 11, 12, 13
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    UNIQUE(institution_id, name_short)
);
INSERT INTO grades VALUES(1,1,'8vo','OCTAVO AÑO DE EDUCACIÓN BÁSICA GENERAL','EGB',8,1);
INSERT INTO grades VALUES(2,1,'9no','NOVENO AÑO DE EDUCACIÓN BÁSICA GENERAL','EGB',9,1);
INSERT INTO grades VALUES(3,1,'10mo','DÉCIMO AÑO DE EDUCACIÓN BÁSICA GENERAL','EGB',10,1);
INSERT INTO grades VALUES(4,1,'1ro BGU','PRIMER AÑO DE BACHILLERATO GENERAL UNIFICADO','BGU',11,1);
INSERT INTO grades VALUES(5,1,'2do BGU','SEGUNDO AÑO DE BACHILLERATO GENERAL UNIFICADO','BGU',12,1);
INSERT INTO grades VALUES(6,1,'3ro BGU','TERCER AÑO DE BACHILLERATO GENERAL UNIFICADO','BGU',13,1);
CREATE TABLE IF NOT EXISTS parallels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    name TEXT NOT NULL,                    -- "A", "B", "C", "D"
    description TEXT,                      -- "Paralelo A", "Ciencias", "Sociales"
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    UNIQUE(institution_id, name)
);
INSERT INTO parallels VALUES(1,1,'A','Paralelo A',1);
INSERT INTO parallels VALUES(2,1,'B','Paralelo B',1);
INSERT INTO parallels VALUES(3,1,'C','Paralelo C',1);
CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    parallel_id INTEGER NOT NULL,
    capacity INTEGER DEFAULT 0,
    classroom_code TEXT,                   -- Código interno del aula
    location TEXT,                         -- Ubicación física
    schedule TEXT CHECK(schedule IN ('MATUTINA', 'VESPERTINA', 'NOCTURNA')),
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (parallel_id) REFERENCES parallels(id),
    -- Una combinación grado+paralelo no puede repetirse en el mismo año lectivo
    UNIQUE(institution_id, academic_year_id, grade_id, parallel_id)
);
INSERT INTO classrooms VALUES(1,1,2,1,1,35,'AUL-8A','Planta Baja - Aula 101','MATUTINA',1);
INSERT INTO classrooms VALUES(2,1,2,1,2,35,'AUL-8B','Planta Baja - Aula 102','MATUTINA',1);
INSERT INTO classrooms VALUES(3,1,2,1,3,35,'AUL-8C','Planta Baja - Aula 103','MATUTINA',1);
INSERT INTO classrooms VALUES(4,1,2,2,1,35,'AUL-9A','Primera Planta - Aula 201','MATUTINA',1);
INSERT INTO classrooms VALUES(5,1,2,2,2,35,'AUL-9B','Primera Planta - Aula 202','MATUTINA',1);
INSERT INTO classrooms VALUES(6,1,2,3,1,35,'AUL-10A','Primera Planta - Aula 203','MATUTINA',1);
INSERT INTO classrooms VALUES(7,1,2,3,2,35,'AUL-10B','Primera Planta - Aula 204','MATUTINA',1);
INSERT INTO classrooms VALUES(8,1,2,4,1,30,'AUL-1BGU-A','Segunda Planta - Aula 301','MATUTINA',1);
INSERT INTO classrooms VALUES(9,1,2,5,1,30,'AUL-2BGU-A','Segunda Planta - Aula 302','MATUTINA',1);
INSERT INTO classrooms VALUES(10,1,2,6,1,30,'AUL-3BGU-A','Segunda Planta - Aula 303','MATUTINA',1);
CREATE TABLE IF NOT EXISTS course_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    hours_per_week INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE(classroom_id, subject_id)
);
INSERT INTO course_subjects VALUES(1,1,1,6,1);
INSERT INTO course_subjects VALUES(2,1,2,5,1);
INSERT INTO course_subjects VALUES(3,1,3,4,1);
INSERT INTO course_subjects VALUES(4,1,4,3,1);
INSERT INTO course_subjects VALUES(5,1,5,3,1);
INSERT INTO course_subjects VALUES(6,1,6,2,1);
INSERT INTO course_subjects VALUES(7,1,7,2,1);
INSERT INTO course_subjects VALUES(8,2,1,6,1);
INSERT INTO course_subjects VALUES(9,2,2,5,1);
INSERT INTO course_subjects VALUES(10,2,3,4,1);
INSERT INTO course_subjects VALUES(11,2,4,3,1);
INSERT INTO course_subjects VALUES(12,2,5,3,1);
INSERT INTO course_subjects VALUES(13,2,6,2,1);
INSERT INTO course_subjects VALUES(14,2,7,2,1);
INSERT INTO course_subjects VALUES(15,3,1,6,1);
INSERT INTO course_subjects VALUES(16,3,2,5,1);
INSERT INTO course_subjects VALUES(17,3,3,4,1);
INSERT INTO course_subjects VALUES(18,3,4,3,1);
INSERT INTO course_subjects VALUES(19,3,5,3,1);
INSERT INTO course_subjects VALUES(20,3,6,2,1);
INSERT INTO course_subjects VALUES(21,3,7,2,1);
INSERT INTO course_subjects VALUES(22,4,1,6,1);
INSERT INTO course_subjects VALUES(23,4,2,5,1);
INSERT INTO course_subjects VALUES(24,4,3,4,1);
INSERT INTO course_subjects VALUES(25,4,4,3,1);
INSERT INTO course_subjects VALUES(26,4,5,3,1);
INSERT INTO course_subjects VALUES(27,4,6,2,1);
INSERT INTO course_subjects VALUES(28,4,7,2,1);
INSERT INTO course_subjects VALUES(29,5,1,6,1);
INSERT INTO course_subjects VALUES(30,5,2,5,1);
INSERT INTO course_subjects VALUES(31,5,3,4,1);
INSERT INTO course_subjects VALUES(32,5,4,3,1);
INSERT INTO course_subjects VALUES(33,5,5,3,1);
INSERT INTO course_subjects VALUES(34,5,6,2,1);
INSERT INTO course_subjects VALUES(35,5,7,2,1);
INSERT INTO course_subjects VALUES(36,6,1,6,1);
INSERT INTO course_subjects VALUES(37,6,2,5,1);
INSERT INTO course_subjects VALUES(38,6,3,4,1);
INSERT INTO course_subjects VALUES(39,6,4,3,1);
INSERT INTO course_subjects VALUES(40,6,5,3,1);
INSERT INTO course_subjects VALUES(41,6,6,2,1);
INSERT INTO course_subjects VALUES(42,6,7,2,1);
INSERT INTO course_subjects VALUES(43,7,1,6,1);
INSERT INTO course_subjects VALUES(44,7,2,5,1);
INSERT INTO course_subjects VALUES(45,7,3,4,1);
INSERT INTO course_subjects VALUES(46,7,4,3,1);
INSERT INTO course_subjects VALUES(47,7,5,3,1);
INSERT INTO course_subjects VALUES(48,7,6,2,1);
INSERT INTO course_subjects VALUES(49,7,7,2,1);
INSERT INTO course_subjects VALUES(50,8,1,4,1);
INSERT INTO course_subjects VALUES(51,8,2,4,1);
INSERT INTO course_subjects VALUES(52,8,3,4,1);
INSERT INTO course_subjects VALUES(53,8,4,3,1);
INSERT INTO course_subjects VALUES(54,8,5,3,1);
INSERT INTO course_subjects VALUES(55,8,6,2,1);
INSERT INTO course_subjects VALUES(56,8,7,2,1);
INSERT INTO course_subjects VALUES(57,9,1,4,1);
INSERT INTO course_subjects VALUES(58,9,2,4,1);
INSERT INTO course_subjects VALUES(59,9,3,4,1);
INSERT INTO course_subjects VALUES(60,9,4,3,1);
INSERT INTO course_subjects VALUES(61,9,5,3,1);
INSERT INTO course_subjects VALUES(62,9,6,2,1);
INSERT INTO course_subjects VALUES(63,9,7,2,1);
INSERT INTO course_subjects VALUES(64,10,1,4,1);
INSERT INTO course_subjects VALUES(65,10,2,4,1);
INSERT INTO course_subjects VALUES(66,10,3,4,1);
INSERT INTO course_subjects VALUES(67,10,4,3,1);
INSERT INTO course_subjects VALUES(68,10,5,3,1);
INSERT INTO course_subjects VALUES(69,10,6,2,1);
INSERT INTO course_subjects VALUES(70,10,7,2,1);
CREATE TABLE IF NOT EXISTS student_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    enrollment_date DATE,
    status TEXT CHECK(status IN ('ENROLLED', 'WITHDRAWN', 'TRANSFERRED', 'GRADUATED')) DEFAULT 'ENROLLED',
    new_student BOOLEAN DEFAULT 1,        -- Si es nuevo en la institución
    previous_institution TEXT,            -- Si viene de otra institución
    repeated_year BOOLEAN DEFAULT 0,      -- Si repite el año
    year_repeated TEXT,                   -- Qué año repitió
    schedule TEXT CHECK(schedule IN ('MATUTINA', 'VESPERTINA', 'NOCTURNA')),
    withdrawal_date DATE,
    withdrawal_reason TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    -- Un estudiante solo puede estar matriculado en una aula por año lectivo
    UNIQUE(student_id, academic_year_id, active)
);
CREATE TABLE IF NOT EXISTS classroom_tutors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT 1,
    notes TEXT,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    -- Un aula solo puede tener un tutor activo por año lectivo
    UNIQUE(classroom_id, academic_year_id, active)
);
INSERT INTO classroom_tutors VALUES(3,1,55,2,NULL,NULL,1,NULL);
INSERT INTO classroom_tutors VALUES(4,2,55,2,'2025-08-29','2025-12-30',1,'Creado desde el postman Test');
INSERT INTO classroom_tutors VALUES(5,3,72,2,'2025-08-29','2025-12-30',1,'Creado desde el postman Test');
INSERT INTO classroom_tutors VALUES(6,4,73,2,'29-08-2025',NULL,1,'Creado desde el postman Test');
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    course_subject_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT 1,
    notes TEXT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (course_subject_id) REFERENCES course_subjects(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    -- Un profesor no puede estar asignado dos veces a la misma materia en el mismo año
    UNIQUE(teacher_id, course_subject_id, academic_year_id, active)
);
INSERT INTO teacher_assignments VALUES(1,55,1,2,NULL,NULL,1,NULL);
INSERT INTO teacher_assignments VALUES(2,55,2,2,NULL,NULL,1,NULL);
INSERT INTO teacher_assignments VALUES(3,55,3,2,'31-08-2025','10-12-2025',1,'Creado desde postman');
CREATE TABLE IF NOT EXISTS authority_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    authority_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    position_type TEXT CHECK(position_type IN ('PRINCIPAL','DIRECTOR','EDUCATIONAL_LEADER','VICE_PRINCIPAL','GENERAL_INSPECTOR','SUB_INSPECTOR')) NOT NULL,
    schedule TEXT CHECK(schedule IN ('MATUTINA', 'VESPERTINA', 'NOCTURNA')),
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (authority_id) REFERENCES authorities(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    -- Una autoridad no puede tener el mismo cargo dos veces en el mismo año
    UNIQUE(authority_id, academic_year_id, position_type, active)
);
CREATE TABLE IF NOT EXISTS student_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    disability BOOLEAN DEFAULT 0,
    psychopedagogical_evaluation TEXT,
    accident TEXT,
    allergies TEXT,
    surgeries TEXT,
    illnesses TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(student_id) -- Un registro de salud por estudiante
);
CREATE TABLE IF NOT EXISTS student_gender (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    gender TEXT CHECK(gender IN ('MALE','FEMALE')) NOT NULL,
    pregnancy BOOLEAN DEFAULT 0,
    pregnancy_months INTEGER,
    medical_control BOOLEAN DEFAULT 0,
    high_risk BOOLEAN DEFAULT 0,
    institutional_support TEXT,
    breastfeeding BOOLEAN DEFAULT 0,
    breastfeeding_months INTEGER,
    child_gender TEXT,
    child_days_old INTEGER,
    maternity BOOLEAN DEFAULT 0,
    maternity_duration TEXT,
    paternity BOOLEAN DEFAULT 0,
    paternity_duration TEXT,
    partner_name TEXT,
    partner_age INTEGER,
    partner_phone TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(student_id) -- Un registro de género por estudiante
);
CREATE TABLE IF NOT EXISTS disciplinary_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    incident_date DATE NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    notified_guardian BOOLEAN DEFAULT 0,
    guardian_signature BOOLEAN DEFAULT 0,
    document_path TEXT,
    no_signature_reason TEXT,
    disciplinary_measure TEXT,
    resolution TEXT,
    measure_completed BOOLEAN DEFAULT 0,
    incomplete_reason TEXT,
    follow_up_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);
CREATE TABLE IF NOT EXISTS violence_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    case_type TEXT CHECK(case_type IN ('PHYSICAL', 'PSYCHOLOGICAL', 'SEXUAL', 'NEGLECT', 'OTHER')),
    referral_institution TEXT CHECK(referral_institution IN ('PROSECUTOR','EDUCATION_DISTRICT','HEALTH_MINISTRY','CANTONAL_BOARD','PATRONATO_QUININDE','CANTONAL_COUNCIL','OTHER')),
    referral_date DATE,
    detection_date DATE NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('OPEN', 'IN_PROCESS', 'RESOLVED', 'CLOSED')) DEFAULT 'OPEN',
    resolution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    appointment_type TEXT CHECK(appointment_type IN ('INDIVIDUAL', 'GROUP', 'FAMILY', 'INSTITUTIONAL')),
    institution TEXT CHECK(institution IN ('PROSECUTOR','EDUCATION_DISTRICT','HEALTH_MINISTRY','CANTONAL_BOARD','PATRONATO_QUININDE','CANTONAL_COUNCIL','OTHER')),
    appointment_date DATETIME NOT NULL,
    status TEXT CHECK(status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')) DEFAULT 'SCHEDULED',
    notified BOOLEAN DEFAULT 0,
    attended BOOLEAN DEFAULT 0,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);
CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    training_name TEXT NOT NULL,
    target_group TEXT CHECK(target_group IN ('TEACHERS','STUDENTS','PARENTS','MIXED')) NOT NULL,
    training_date DATE,
    duration_hours INTEGER,
    facilitator TEXT,
    description TEXT,
    participants_count INTEGER DEFAULT 0,
    beneficiaries_count INTEGER DEFAULT 0,
    attendance_file_path TEXT,
    status TEXT CHECK(status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'PLANNED',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);
CREATE TABLE IF NOT EXISTS training_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    training_id INTEGER NOT NULL,
    participant_type TEXT CHECK(participant_type IN ('TEACHER', 'STUDENT', 'PARENT', 'OTHER')) NOT NULL,
    participant_id INTEGER, -- ID del teacher, student, etc.
    participant_name TEXT, -- Si no está en el sistema
    attended BOOLEAN DEFAULT 0,
    evaluation_score REAL,
    notes TEXT,
    FOREIGN KEY (training_id) REFERENCES trainings(id)
);
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    id_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    phone_alt TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);
INSERT INTO teachers VALUES(55,1,'1712345678','Carlos Andrés','Mendoza Rojas','carlos.andres.mendoza@dece.com','0987654321','123456',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(56,1,'1723456789','Ana Sofía','Paredes Torres','ana.sofia.paredes@dece.com','0998765432','234567',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(57,1,'1734567890','Luis Fernando','Torres Salazar','luis.fernando.torres@dece.com','0976543210','345678',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(58,1,'1745678901','María José','González Castro','maria.jose.gonzalez@dece.com','0965432109','456789',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(59,1,'1756789012','Jorge Iván','Rojas Vargas','jorge.ivan.rojas@dece.com','0954321098','567890',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(60,1,'1767890123','Sofía Valentina','Vargas Cordero','sofia.valentina.vargas@dece.com','0943210987','678901',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(61,1,'1778901234','Daniel Alejandro','Cordero Mora','daniel.alejandro.cordero@dece.com','0932109876','789012',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(62,1,'1789012345','Lucía Fernanda','Mora Salazar','lucia.fernanda.mora@dece.com','0921098765','890123',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(63,1,'1790123456','Andrés Felipe','Salazar Castro','andres.felipe.salazar@dece.com','0910987654','901234',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(64,1,'1801234567','Paola Estefanía','Castro Rojas','paola.estefania.castro@dece.com','0909876543','012345',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(65,1,'1812345678','Miguel Ángel','Vásquez Ramírez','miguel.angel.vasquez@dece.com','0990123456','123457',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(66,1,'1823456789','Isabel Cristina','Ramírez López','isabel.cristina.ramirez@dece.com','0989012345','234568',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(67,1,'1834567890','Fernando José','Lopez Navarro','fernando.jose.lopez@dece.com','0978901234','345679',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(68,1,'1845678901','Claudia Patricia','Navarro Cevallos','claudia.patricia.navarro@dece.com','0967890123','456780',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(69,1,'1856789012','Ricardo Andrés','Cevallos Maldonado','ricardo.andres.cevallos@dece.com','0956789012','567891',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(70,1,'1867890123','Valentina María','Maldonado Rivas','valentina.maria.maldonado@dece.com','0945678901','678902',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(71,1,'1878901234','Esteban Javier','Rivas Aguirre','esteban.javier.rivas@dece.com','0934567890','789013',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(72,1,'1889012345','Camila Fernanda','Aguirre Quintero','camila.fernanda.aguirre@dece.com','0923456789','890124',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(73,1,'1890123456','Javier Andrés','Quintero Paz','javier.andres.quintero@dece.com','0912345678','901235',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(74,1,'1901234567','Natalia Sofía','Paz Figueroa','natalia.sofia.paz@dece.com','0901234567','012346',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(75,1,'1912345678','Sebastián José','Figueroa Sánchez','sebastian.jose.figueroa@dece.com','0991234567','123458',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(76,1,'1923456789','Gabriela Isabel','Sánchez Chávez','gabriela.isabel.sanchez@dece.com','0982345678','234569',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(77,1,'1934567890','Ricardo Eduardo','Chávez Hurtado','ricardo.eduardo.chavez@dece.com','0973456789','345670',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(78,1,'1945678901','Fernanda Valeria','Hurtado Benítez','fernanda.valeria.hurtado@dece.com','0964567890','456781',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(79,1,'1956789012','Mateo Andrés','Benítez Vélez','mateo.andres.benitez@dece.com','0955678901','567892',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(80,1,'1967890123','Paula Andrea','Vélez Bravo','paula.andrea.velez@dece.com','0946789012','678903',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(81,1,'1978901234','Andrés Miguel','Bravo Lara','andres.miguel.bravo@dece.com','0937890123','789014',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(82,1,'1989012345','Mariana Isabel','Lara Salinas','mariana.isabel.lara@dece.com','0928901234','890125',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(83,1,'1990123456','Diego Alejandro','Salinas Murillo','diego.alejandro.salinas@dece.com','0919012345','901236',1,'2025-08-28 22:06:01');
INSERT INTO teachers VALUES(84,1,'2001234567','Carla Valentina','Murillo Torres','carla.valentina.murillo@dece.com','0900123456','012347',1,'2025-08-28 22:06:01');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('institutions',1);
INSERT INTO sqlite_sequence VALUES('academic_years',3);
INSERT INTO sqlite_sequence VALUES('grades',6);
INSERT INTO sqlite_sequence VALUES('parallels',3);
INSERT INTO sqlite_sequence VALUES('teachers',84);
INSERT INTO sqlite_sequence VALUES('classrooms',10);
INSERT INTO sqlite_sequence VALUES('subjects',7);
INSERT INTO sqlite_sequence VALUES('course_subjects',70);
INSERT INTO sqlite_sequence VALUES('classroom_tutors',6);
INSERT INTO sqlite_sequence VALUES('teacher_assignments',3);
CREATE INDEX idx_student_enrollments_academic_year ON student_enrollments(academic_year_id);
CREATE INDEX idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_classrooms_academic_year ON classrooms(academic_year_id);
CREATE INDEX idx_teacher_assignments_academic_year ON teacher_assignments(academic_year_id);
CREATE INDEX idx_violence_cases_academic_year ON violence_cases(academic_year_id);
CREATE INDEX idx_appointments_academic_year ON appointments(academic_year_id);
COMMIT;
