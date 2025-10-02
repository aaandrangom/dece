// Datos quemados para docentes
export const teachersData = [
  {
    id: 1,
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@colegio.edu',
    phone: '+57 300 123 4567',
    document: '12345678',
    documentType: 'CC',
    birthDate: '1985-03-15',
    address: 'Carrera 15 #23-45, Bogotá',
    hireDate: '2020-02-10',
    status: 'Activo',
    specialization: 'Matemáticas',
    education: 'Licenciatura en Matemáticas',
    subjects: ['Álgebra', 'Geometría', 'Cálculo'],
    grades: ['9°', '10°', '11°'],
    workload: 'Tiempo completo',
    salary: 3500000,
    emergencyContact: {
      name: 'Carlos González',
      relationship: 'Esposo',
      phone: '+57 300 987 6543'
    }
  },
  {
    id: 2,
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@colegio.edu',
    phone: '+57 301 234 5678',
    document: '23456789',
    documentType: 'CC',
    birthDate: '1978-07-22',
    address: 'Calle 45 #12-34, Medellín',
    hireDate: '2018-08-15',
    status: 'Activo',
    specialization: 'Ciencias Naturales',
    education: 'Licenciatura en Biología',
    subjects: ['Biología', 'Química', 'Física'],
    grades: ['6°', '7°', '8°'],
    workload: 'Tiempo completo',
    salary: 3200000,
    emergencyContact: {
      name: 'Ana Rodríguez',
      relationship: 'Madre',
      phone: '+57 301 876 5432'
    }
  },
  {
    id: 3,
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@colegio.edu',
    phone: '+57 302 345 6789',
    document: '34567890',
    documentType: 'CC',
    birthDate: '1990-11-08',
    address: 'Avenida 68 #34-56, Cali',
    hireDate: '2021-01-20',
    status: 'Activo',
    specialization: 'Idiomas',
    education: 'Licenciatura en Inglés',
    subjects: ['Inglés', 'Francés'],
    grades: ['1°', '2°', '3°', '4°', '5°'],
    workload: 'Medio tiempo',
    salary: 2000000,
    emergencyContact: {
      name: 'Luis Martínez',
      relationship: 'Hermano',
      phone: '+57 302 765 4321'
    }
  },
  {
    id: 4,
    firstName: 'Pedro',
    lastName: 'López',
    email: 'pedro.lopez@colegio.edu',
    phone: '+57 303 456 7890',
    document: '45678901',
    documentType: 'CC',
    birthDate: '1982-05-12',
    address: 'Carrera 7 #45-67, Barranquilla',
    hireDate: '2019-03-05',
    status: 'Licencia',
    specialization: 'Educación Física',
    education: 'Licenciatura en Educación Física',
    subjects: ['Educación Física', 'Deportes'],
    grades: ['6°', '7°', '8°', '9°', '10°', '11°'],
    workload: 'Tiempo completo',
    salary: 2800000,
    emergencyContact: {
      name: 'Carmen López',
      relationship: 'Esposa',
      phone: '+57 303 654 3210'
    }
  },
  {
    id: 5,
    firstName: 'Laura',
    lastName: 'Hernández',
    email: 'laura.hernandez@colegio.edu',
    phone: '+57 304 567 8901',
    document: '56789012',
    documentType: 'CC',
    birthDate: '1987-09-25',
    address: 'Calle 20 #56-78, Cartagena',
    hireDate: '2022-09-01',
    status: 'Activo',
    specialization: 'Arte',
    education: 'Licenciatura en Artes Plásticas',
    subjects: ['Artes Plásticas', 'Dibujo', 'Pintura'],
    grades: ['1°', '2°', '3°', '4°', '5°'],
    workload: 'Medio tiempo',
    salary: 1800000,
    emergencyContact: {
      name: 'Miguel Hernández',
      relationship: 'Padre',
      phone: '+57 304 543 2109'
    }
  },
  {
    id: 6,
    firstName: 'Roberto',
    lastName: 'Jiménez',
    email: 'roberto.jimenez@colegio.edu',
    phone: '+57 305 678 9012',
    document: '67890123',
    documentType: 'CC',
    birthDate: '1975-12-03',
    address: 'Carrera 30 #67-89, Bucaramanga',
    hireDate: '2015-07-10',
    status: 'Activo',
    specialization: 'Historia',
    education: 'Licenciatura en Historia',
    subjects: ['Historia', 'Geografía', 'Cívica'],
    grades: ['8°', '9°', '10°', '11°'],
    workload: 'Tiempo completo',
    salary: 3800000,
    emergencyContact: {
      name: 'Isabel Jiménez',
      relationship: 'Esposa',
      phone: '+57 305 432 1098'
    }
  }
];

export const subjectsData = [
  'Matemáticas', 'Álgebra', 'Geometría', 'Cálculo', 'Estadística',
  'Español', 'Literatura', 'Gramática',
  'Inglés', 'Francés', 'Alemán',
  'Biología', 'Química', 'Física', 'Ciencias Naturales',
  'Historia', 'Geografía', 'Cívica', 'Filosofía',
  'Artes Plásticas', 'Dibujo', 'Pintura', 'Música',
  'Educación Física', 'Deportes',
  'Informática', 'Tecnología',
  'Religión', 'Ética'
];

export const gradesData = [
  'Preescolar', '1°', '2°', '3°', '4°', '5°',
  '6°', '7°', '8°', '9°', '10°', '11°'
];

export const workloadOptions = [
  'Tiempo completo',
  'Medio tiempo',
  'Por horas'
];

export const statusOptions = [
  'Activo',
  'Inactivo',
  'Licencia',
  'Vacaciones'
];

export const documentTypes = [
  'CC', 'CE', 'PA', 'TI'
];
