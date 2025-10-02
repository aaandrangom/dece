-- ==========================================
-- DATABASE SCRIPT – DECE SYSTEM (SQLite)
-- REDISEÑO CON AÑO LECTIVO
-- ==========================================

-- ==========================================
-- 1. TABLAS MAESTRAS (Información estática)
-- ==========================================

-- 1.1. Instituciones
CREATE TABLE institutions (
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

-- 1.2. Años lectivos
CREATE TABLE academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_code TEXT UNIQUE NOT NULL,     -- "2024-2025", "2025-2026"
    year_name TEXT NOT NULL,            -- "Año Lectivo 2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_year BOOLEAN DEFAULT 0,     -- Solo un año puede ser el actual
    active BOOLEAN DEFAULT 1
);

-- 1.3. Estudiantes (Solo información personal que NO cambia)
CREATE TABLE students (
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

-- 1.4. Representantes/Tutores legales (información estática)
CREATE TABLE guardians (
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

-- 1.5. Profesores (información personal que NO cambia)
CREATE TABLE teachers (
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

-- 1.6. Autoridades (información personal que NO cambia)
CREATE TABLE authorities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    id_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (institution_id) REFERENCES institutions(id)
);

-- 1.7. Usuarios del sistema DECE
CREATE TABLE users (
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

-- 1.8. Materias
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT 1
);

-- 1.9. Grados (niveles educativos)
CREATE TABLE grades (
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

-- 1.10. Paralelos
CREATE TABLE parallels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    name TEXT NOT NULL,                    -- "A", "B", "C", "D"
    description TEXT,                      -- "Paralelo A", "Ciencias", "Sociales"
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    UNIQUE(institution_id, name)
);

-- ==========================================
-- 2. TABLAS POR AÑO LECTIVO (Información que cambia cada año)
-- ==========================================

-- 2.1. Aulas/Cursos por año lectivo
CREATE TABLE classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_id INTEGER NOT NULL,
    academic_year_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    parallel_id INTEGER NOT NULL,
    capacity INTEGER DEFAULT 0,
    classroom_code TEXT, -- Código interno del aula
    location TEXT, -- Ubicación física
    schedule TEXT CHECK(schedule IN ('MATUTINA', 'VESPERTINA', 'NOCTURNA')),
    active BOOLEAN DEFAULT 1,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (parallel_id) REFERENCES parallels(id),
    
    -- Una combinación grado+paralelo+horario no puede repetirse en el mismo año lectivo
    -- Esto permite tener 9no "C" en MATUTINA, VESPERTINA y NOCTURNA como aulas separadas
    UNIQUE(institution_id, academic_year_id, grade_id, parallel_id, schedule)
);

-- 2.2. Materias por curso y año lectivo
CREATE TABLE course_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    hours_per_week INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE(classroom_id, subject_id)
);

-- 2.3. Matrículas de estudiantes por año lectivo
CREATE TABLE student_enrollments (
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

-- 2.4. Tutores de aula por año lectivo
CREATE TABLE classroom_tutors (
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

-- 2.5. Asignaciones de profesores a materias por año lectivo
CREATE TABLE teacher_assignments (
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
    UNIQUE(course_subject_id, academic_year_id, active)
);

-- 2.6. Cargos de autoridades por año lectivo
CREATE TABLE authority_positions (
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

-- ==========================================
-- 3. TABLAS DE INFORMACIÓN ESTUDIANTIL
-- ==========================================

-- 3.1. Salud estudiantil
CREATE TABLE student_health (
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

-- 3.2. Información de género estudiantil
CREATE TABLE student_gender (
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

-- ==========================================
-- 4. TABLAS DE SEGUIMIENTO Y CASOS
-- ==========================================

-- 4.1. Registros disciplinarios
CREATE TABLE disciplinary_records (
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

-- 4.2. Casos de violencia
CREATE TABLE violence_cases (
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

-- 4.3. Citas y seguimientos
CREATE TABLE appointments (
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

-- ==========================================
-- 5. TABLAS DE CAPACITACIONES
-- ==========================================

-- 5.1. Capacitaciones por año lectivo
CREATE TABLE trainings (
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

-- 5.2. Participantes en capacitaciones
CREATE TABLE training_participants (
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

-- ==========================================
-- 6. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ==========================================

-- Índices para consultas frecuentes
CREATE INDEX idx_student_enrollments_academic_year ON student_enrollments(academic_year_id);
CREATE INDEX idx_student_enrollments_classroom ON student_enrollments(classroom_id);
CREATE INDEX idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_classrooms_academic_year ON classrooms(academic_year_id);
CREATE INDEX idx_teacher_assignments_academic_year ON teacher_assignments(academic_year_id);
CREATE INDEX idx_disciplinary_records_academic_year ON disciplinary_records(academic_year_id);
CREATE INDEX idx_violence_cases_academic_year ON violence_cases(academic_year_id);
CREATE INDEX idx_appointments_academic_year ON appointments(academic_year_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- ==========================================
-- 7. DATOS INICIALES EJEMPLO
-- ==========================================

-- Insertar año lectivo actual
INSERT INTO academic_years (year_code, year_name, start_date, end_date, current_year) 
VALUES ('2024-2025', 'Año Lectivo 2024-2025', '2024-09-01', '2025-07-31', 1);

-- Materias básicas
INSERT INTO subjects (name, code) VALUES 
('Matemáticas', 'MAT'),
('Lengua y Literatura', 'LEN'),
('Ciencias Naturales', 'CCN'),
('Estudios Sociales', 'EES'),
('Inglés', 'ING'),
('Educación Física', 'EDF'),
('Educación Cultural y Artística', 'ECA');