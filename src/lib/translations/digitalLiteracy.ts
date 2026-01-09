// Digital Literacy Program - Bilingual Translations
// Programa de Alfabetización Digital - Traducciones Bilingües

export type Language = 'en' | 'es';

export interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

// Class schedule options
export const CLASS_SCHEDULES = [
  { id: 'class1', en: 'Class 1: Monday 10:00 AM - 12:00 PM', es: 'Clase 1: Lunes 10:00 AM - 12:00 PM' },
  { id: 'class2', en: 'Class 2: Monday 1:00 PM - 3:00 PM', es: 'Clase 2: Lunes 1:00 PM - 3:00 PM' },
  { id: 'class3', en: 'Class 3: Tuesday 10:00 AM - 12:00 PM', es: 'Clase 3: Martes 10:00 AM - 12:00 PM' },
  { id: 'class4', en: 'Class 4: Tuesday 1:00 PM - 3:00 PM', es: 'Clase 4: Martes 1:00 PM - 3:00 PM' },
  { id: 'class5', en: 'Class 5: Wednesday 10:00 AM - 12:00 PM', es: 'Clase 5: Miércoles 10:00 AM - 12:00 PM' },
  { id: 'class6', en: 'Class 6: Wednesday 1:00 PM - 3:00 PM', es: 'Clase 6: Miércoles 1:00 PM - 3:00 PM' },
];

// Counties
export const COUNTIES = [
  { id: 'moore', en: 'Moore County', es: 'Condado de Moore' },
  { id: 'montgomery', en: 'Montgomery County', es: 'Condado de Montgomery' },
];

// Course topics by week
export const COURSE_TOPICS = [
  { 
    code: 'Class1A', 
    week: 1, 
    en: 'Introduction to Navigating the Digital World', 
    es: 'Introducción a Navegando el mundo digital' 
  },
  { 
    code: 'Class1B', 
    week: 1, 
    en: 'Understanding Computers and Mobile Devices', 
    es: 'Conociendo las computadoras y dispositivos móviles' 
  },
  { 
    code: 'Class2A', 
    week: 2, 
    en: 'Basic Internet Skills', 
    es: 'Habilidades Básicas de internet' 
  },
  { 
    code: 'Class2B', 
    week: 2, 
    en: 'Email and Communication', 
    es: 'Correo Electrónico y comunicación' 
  },
  { 
    code: 'Class3A', 
    week: 3, 
    en: 'Basic Social Media Concepts', 
    es: 'Conceptos Básicos de Redes sociales' 
  },
  { 
    code: 'Class3B', 
    week: 3, 
    en: 'Using Online Services', 
    es: 'Utilización de servicios en línea' 
  },
  { 
    code: 'Class4A', 
    week: 4, 
    en: 'Creating Digital Content with Google Suite', 
    es: 'Creación de Contenido Digital con Google Suite' 
  },
  { 
    code: 'Class4B', 
    week: 4, 
    en: 'Digital Tools for Daily Life', 
    es: 'Herramientas Digitales para la Vida Diaria' 
  },
  { 
    code: 'Class5A', 
    week: 5, 
    en: 'Online Security and Privacy', 
    es: 'Seguridad y Privacidad en Línea' 
  },
  { 
    code: 'Class5B', 
    week: 5, 
    en: 'Course Review and Practical Applications', 
    es: 'Revisión del Curso y Aplicaciones prácticas' 
  },
];

// Proficiency levels
export const PROFICIENCY_LEVELS = [
  { 
    id: 'beginning', 
    en: 'Beginning', 
    es: 'Principiante', 
    color: '#ef4444', // red
    descEn: 'Student is just starting to learn; needs significant guidance',
    descEs: 'El estudiante está comenzando a aprender; necesita orientación significativa'
  },
  { 
    id: 'developing', 
    en: 'Developing', 
    es: 'En Desarrollo', 
    color: '#eab308', // yellow
    descEn: 'Student shows growing understanding; can perform with assistance',
    descEs: 'El estudiante muestra comprensión creciente; puede realizar con asistencia'
  },
  { 
    id: 'proficient', 
    en: 'Proficient', 
    es: 'Competente', 
    color: '#22c55e', // green
    descEn: 'Student demonstrates solid understanding; can perform independently',
    descEs: 'El estudiante demuestra comprensión sólida; puede realizar independientemente'
  },
  { 
    id: 'mastery', 
    en: 'Mastery', 
    es: 'Dominio', 
    color: '#3b82f6', // blue
    descEn: 'Student shows deep expertise; can teach others',
    descEs: 'El estudiante muestra experiencia profunda; puede enseñar a otros'
  },
];

// Main translations object
export const TRANSLATIONS = {
  // Program title
  programTitle: {
    en: 'Digital Literacy Program',
    es: 'Programa de Alfabetización Digital'
  },
  
  // Navigation
  nav: {
    dashboard: { en: 'Dashboard', es: 'Panel de Control' },
    classList: { en: 'Class List', es: 'Lista de Clases' },
    reports: { en: 'Reports', es: 'Informes' },
    settings: { en: 'Settings', es: 'Configuración' },
    registration: { en: 'Registration', es: 'Registro' },
    students: { en: 'Students', es: 'Estudiantes' },
  },
  
  // Language toggle
  language: {
    label: { en: 'Language', es: 'Idioma' },
    switch: { en: 'Switch', es: 'Cambiar' },
    english: { en: 'English', es: 'Inglés' },
    spanish: { en: 'Spanish', es: 'Español' },
  },
  
  // Registration form
  registration: {
    title: { 
      en: 'DIGITAL LITERACY PROGRAM REGISTRATION', 
      es: 'REGISTRO DEL PROGRAMA DE ALFABETIZACIÓN DIGITAL' 
    },
    instructions: {
      en: 'Please complete all fields below to register for the Digital Literacy Program. You will receive confirmation via email.',
      es: 'Por favor complete todos los campos a continuación para registrarse en el Programa de Alfabetización Digital. Recibirá una confirmación por correo electrónico.'
    },
    scanToRegister: { en: 'SCAN TO REGISTER', es: 'ESCANEAR PARA REGISTRARSE' },
    
    // Field labels
    registrationDate: { en: 'Registration Date', es: 'Fecha de Registro' },
    classTime: { en: 'Class Time', es: 'Horario de Clase' },
    selectClassTime: { en: 'Select Your Class Time', es: 'Seleccione su Horario de Clase' },
    studentName: { en: 'Student Name', es: 'Nombre del Estudiante' },
    emailAddress: { en: 'Email Address', es: 'Correo Electrónico' },
    phoneNumber: { en: 'Phone Number', es: 'Número de Teléfono' },
    county: { en: 'County of Residence', es: 'Condado de Residencia' },
    selectCounty: { en: 'Select Your County', es: 'Seleccione su Condado' },
    
    // Help text
    helpClassLimit: { 
      en: 'Each class is limited to 18 students', 
      es: 'Cada clase está limitada a 18 estudiantes' 
    },
    helpFullName: { en: 'Enter your full name', es: 'Ingrese su nombre completo' },
    helpEmail: { 
      en: 'We will send confirmation to this email', 
      es: 'Enviaremos confirmación a este correo' 
    },
    helpPhone: { en: 'Include area code', es: 'Incluya código de área' },
    
    // Placeholders
    placeholderName: { en: 'First Name Last Name', es: 'Nombre Apellido' },
    placeholderPhone: { en: 'XXX-XXX-XXXX', es: 'XXX-XXX-XXXX' },
    
    // Submit
    submit: { en: 'Register', es: 'Registrarse' },
    submitting: { en: 'Registering...', es: 'Registrando...' },
  },
  
  // Success/Error messages
  messages: {
    registrationComplete: {
      en: 'REGISTRATION COMPLETE',
      es: 'REGISTRO COMPLETO'
    },
    thankYou: {
      en: 'Thank you for registering! You will receive a confirmation email shortly with your class details.',
      es: '¡Gracias por registrarse! Recibirá un correo electrónico de confirmación en breve con los detalles de su clase.'
    },
    seeYouInClass: { en: 'See you in class!', es: '¡Nos vemos en clase!' },
    
    classFull: {
      en: 'CLASS FULL',
      es: 'CLASE COMPLETA'
    },
    classFullDesc: {
      en: 'This class has reached maximum capacity (18 students). Please select a different time.',
      es: 'Esta clase ha alcanzado su capacidad máxima (18 estudiantes). Por favor seleccione un horario diferente.'
    },
    
    emailRegistered: {
      en: 'EMAIL ALREADY REGISTERED',
      es: 'CORREO YA REGISTRADO'
    },
    emailRegisteredDesc: {
      en: 'This email is already registered for a class. If you need to change your registration, please contact us.',
      es: 'Este correo electrónico ya está registrado para una clase. Si necesita cambiar su registro, por favor contáctenos.'
    },
    
    requiredField: { en: 'This field is required', es: 'Este campo es requerido' },
    invalidEmail: { en: 'Please enter a valid email', es: 'Por favor ingrese un correo válido' },
    invalidPhone: { en: 'Please enter a valid phone number', es: 'Por favor ingrese un número válido' },
  },
  
  // Dashboard
  dashboard: {
    selectClass: { en: 'SELECT CLASS', es: 'SELECCIONAR CLASE' },
    currentClass: { en: 'Current Class', es: 'Clase Actual' },
    week: { en: 'Week', es: 'Semana' },
    of: { en: 'of', es: 'de' },
    
    classStatus: { en: 'Class Status', es: 'Estado de la Clase' },
    enrolled: { en: 'Enrolled', es: 'Inscritos' },
    students: { en: 'students', es: 'estudiantes' },
    full: { en: 'FULL', es: 'COMPLETO' },
    presentToday: { en: 'Present Today', es: 'Presentes Hoy' },
    absent: { en: 'Absent', es: 'Ausentes' },
    unassessed: { en: 'UNASSESSED', es: 'SIN EVALUAR' },
    needsProficiencyTags: { 
      en: 'students need proficiency tags', 
      es: 'estudiantes necesitan evaluación' 
    },
    
    loadClass: { en: 'LOAD CLASS', es: 'CARGAR CLASE' },
    viewAllClasses: { en: 'VIEW ALL CLASSES', es: 'VER TODAS' },
    reports: { en: 'REPORTS', es: 'INFORMES' },
    
    today: { en: 'Today', es: 'Hoy' },
    instructor: { en: 'Instructor', es: 'Instructor' },
  },
  
  // Student card
  studentCard: {
    attendance: { en: 'Attendance', es: 'Asistencia' },
    weekTopics: { en: 'Week Topics', es: 'Temas Semana' },
    assessed: { en: 'assessed', es: 'evaluado' },
    present: { en: 'PRESENT', es: 'PRESENTE' },
    absent: { en: 'ABSENT', es: 'AUSENTE' },
    details: { en: 'DETAILS', es: 'DETALLES' },
    needsAssessment: { en: 'NEEDS ASSESSMENT', es: 'NECESITA EVALUACIÓN' },
    markPresent: { en: 'Mark Present', es: 'Marcar Presente' },
    markAbsent: { en: 'Mark Absent', es: 'Marcar Ausente' },
  },
  
  // Alerts
  alerts: {
    proficiencyAlert: { en: 'PROFICIENCY ALERT', es: 'ALERTA DE COMPETENCIA' },
    studentsNeedAssessment: {
      en: 'The following students need proficiency assessment before class ends:',
      es: 'Los siguientes estudiantes necesitan evaluación de competencia antes de que termine la clase:'
    },
    topicsUnassessed: { en: 'topics unassessed', es: 'temas sin evaluar' },
    assessNow: { en: 'ASSESS NOW', es: 'EVALUAR AHORA' },
    dismissAlerts: { en: 'DISMISS ALERTS', es: 'DESCARTAR ALERTAS' },
    autoRemind: { en: 'AUTO-REMIND IN 30 MIN', es: 'RECORDAR EN 30 MIN' },
  },
  
  // Student detail view
  detail: {
    backToClassView: { en: 'BACK TO CLASS VIEW', es: 'VOLVER A VISTA DE CLASE' },
    currentWeek: { en: 'CURRENT WEEK', es: 'SEMANA ACTUAL' },
    proficiency: { en: 'Proficiency', es: 'Competencia' },
    selectLevel: { en: 'Select Level', es: 'Seleccionar Nivel' },
    notAssessed: { en: 'NOT ASSESSED', es: 'SIN EVALUAR' },
    assessedOn: { en: 'Assessed', es: 'Evaluado' },
    
    proficiencySummary: { en: 'PROFICIENCY SUMMARY', es: 'RESUMEN DE COMPETENCIA' },
    assessedTopics: { en: 'Assessed Topics', es: 'Temas Evaluados' },
    topics: { en: 'topics', es: 'temas' },
    notYetAssessed: { en: 'Not Yet Assessed', es: 'Aún no Evaluado' },
    strengths: { en: 'Strengths', es: 'Fortalezas' },
    growthAreas: { en: 'Growth Areas', es: 'Áreas de Crecimiento' },
  },
  
  // Completion
  completion: {
    title: { en: 'COMPLETION TRACKING', es: 'SEGUIMIENTO DE FINALIZACIÓN' },
    didComplete: { 
      en: 'Did student complete the program?', 
      es: '¿El estudiante completó el programa?' 
    },
    yesCompleted: { en: 'Yes - Completed Successfully', es: 'Sí - Completado Exitosamente' },
    noNotComplete: { en: 'No - Did Not Complete', es: 'No - No Completó' },
    
    ifCompleted: { en: 'IF YES (COMPLETED):', es: 'SI SÍ (COMPLETADO):' },
    dateCompleted: { en: 'Date Completed', es: 'Fecha de Finalización' },
    tabletSerial: { en: 'Tablet Serial Number', es: 'Número de Serie de Tableta' },
    tabletIssued: { en: 'Tablet issued to student', es: 'Tableta entregada al estudiante' },
    
    ifNotCompleted: { en: 'IF NO (DID NOT COMPLETE):', es: 'SI NO (NO COMPLETÓ):' },
    reasonRequired: { 
      en: 'Reason for Non-Completion (required):', 
      es: 'Razón de No Finalización (requerido):' 
    },
    commonReasons: { en: 'Common reasons:', es: 'Razones comunes:' },
    reasonAttendance: { en: 'Attendance below 80%', es: 'Asistencia menor al 80%' },
    reasonWithdrew: { en: 'Student withdrew from program', es: 'Estudiante se retiró del programa' },
    reasonEmergency: { en: 'Health/family emergency', es: 'Emergencia de salud/familia' },
    reasonTransport: { en: 'Transportation issues', es: 'Problemas de transporte' },
    reasonWork: { en: 'Work schedule conflict', es: 'Conflicto de horario laboral' },
    
    instructorSignature: { en: 'INSTRUCTOR SIGNATURE', es: 'FIRMA DEL INSTRUCTOR' },
    instructorName: { en: 'Instructor Name', es: 'Nombre del Instructor' },
    signature: { en: 'Signature', es: 'Firma' },
    date: { en: 'Date', es: 'Fecha' },
  },
  
  // Certificate
  certificate: {
    title: { en: 'CERTIFICATE OF COMPLETION', es: 'CERTIFICADO DE FINALIZACIÓN' },
    certifies: { en: 'This certifies that', es: 'Esto certifica que' },
    hasCompleted: { en: 'has successfully completed', es: 'ha completado exitosamente el' },
    sixWeekCourse: { en: 'Six-Week Course', es: 'Curso de Seis Semanas' },
    attendance: { en: 'Attendance', es: 'Asistencia' },
    proficiencyAchievement: { en: 'Proficiency Achievement', es: 'Logro de Competencia' },
    topicsAtLevel: { 
      en: 'topics at Proficient or Mastery level', 
      es: 'temas a nivel Competente o Dominio' 
    },
    programDirector: { en: 'Program Director', es: 'Director del Programa' },
    certificateNo: { en: 'Certificate No.', es: 'Certificado No.' },
  },
  
  // Reports
  reports: {
    weeklyReport: { en: 'WEEKLY CLASS REPORT', es: 'INFORME SEMANAL DE CLASE' },
    class: { en: 'Class', es: 'Clase' },
    week: { en: 'Week', es: 'Semana' },
    date: { en: 'Date', es: 'Fecha' },
    
    attendanceSection: { en: 'ATTENDANCE', es: 'ASISTENCIA' },
    present: { en: 'Present', es: 'Presentes' },
    absent: { en: 'Absent', es: 'Ausentes' },
    studentsPresent: { en: 'Students Present', es: 'Estudiantes Presentes' },
    
    proficiencySection: { en: 'PROFICIENCY ASSESSMENT', es: 'EVALUACIÓN DE COMPETENCIA' },
    topicsThisWeek: { en: 'Topics This Week', es: 'Temas esta Semana' },
    assessmentCompletion: { en: 'Assessment Completion', es: 'Finalización de Evaluación' },
    allAssessed: { en: 'All present students assessed', es: 'Todos los estudiantes presentes evaluados' },
    yes: { en: 'YES', es: 'SÍ' },
    no: { en: 'NO', es: 'NO' },
    averageProficiency: { en: 'Average proficiency', es: 'Competencia promedio' },
    proficiencyDistribution: { en: 'Proficiency Distribution', es: 'Distribución de Competencia' },
    
    notes: { en: 'NOTES', es: 'NOTAS' },
  },
  
  // Common actions
  actions: {
    save: { en: 'Save', es: 'Guardar' },
    cancel: { en: 'Cancel', es: 'Cancelar' },
    submit: { en: 'Submit', es: 'Enviar' },
    close: { en: 'Close', es: 'Cerrar' },
    edit: { en: 'Edit', es: 'Editar' },
    delete: { en: 'Delete', es: 'Eliminar' },
    print: { en: 'Print', es: 'Imprimir' },
    export: { en: 'Export', es: 'Exportar' },
    search: { en: 'Search', es: 'Buscar' },
    filter: { en: 'Filter', es: 'Filtrar' },
    refresh: { en: 'Refresh', es: 'Actualizar' },
    back: { en: 'Back', es: 'Volver' },
    next: { en: 'Next', es: 'Siguiente' },
    previous: { en: 'Previous', es: 'Anterior' },
  },
  
  // Class info
  classInfo: {
    location: { en: 'Location', es: 'Ubicación' },
    startDate: { en: 'Start Date', es: 'Fecha de Inicio' },
    duration: { en: 'Duration', es: 'Duración' },
    sixWeeks: { en: '6 weeks (18 classes total)', es: '6 semanas (18 clases en total)' },
    whatToBring: { en: 'What to Bring', es: 'Qué Traer' },
    willingnessToLearn: { en: 'Willingness to learn', es: 'Disposición para aprender' },
    notebook: { en: 'A notebook (optional)', es: 'Un cuaderno (opcional)' },
    questions: { en: 'Any questions you have about technology', es: 'Cualquier pregunta que tenga sobre tecnología' },
  },
  
  // Instructor Registration
  instructorRegistration: {
    title: { 
      en: 'INSTRUCTOR REGISTRATION', 
      es: 'REGISTRO DE INSTRUCTOR' 
    },
    subtitle: {
      en: 'Digital Literacy Program Instructor Application',
      es: 'Solicitud de Instructor del Programa de Alfabetización Digital'
    },
    instructions: {
      en: 'Please complete all fields below to apply as an instructor for the Digital Literacy Program.',
      es: 'Por favor complete todos los campos a continuación para aplicar como instructor del Programa de Alfabetización Digital.'
    },
    
    // Personal Information
    personalInfo: { en: 'Personal Information', es: 'Información Personal' },
    firstName: { en: 'First Name', es: 'Nombre' },
    lastName: { en: 'Last Name', es: 'Apellido' },
    email: { en: 'Email Address', es: 'Correo Electrónico' },
    phone: { en: 'Phone Number', es: 'Número de Teléfono' },
    address: { en: 'Address', es: 'Dirección' },
    city: { en: 'City', es: 'Ciudad' },
    state: { en: 'State', es: 'Estado' },
    zipCode: { en: 'ZIP Code', es: 'Código Postal' },
    
    // Professional Information
    professionalInfo: { en: 'Professional Information', es: 'Información Profesional' },
    certifications: { en: 'Certifications', es: 'Certificaciones' },
    selectCertifications: { en: 'Select all that apply', es: 'Seleccione todas las que apliquen' },
    yearsExperience: { en: 'Years of Teaching Experience', es: 'Años de Experiencia Docente' },
    languages: { en: 'Languages Spoken', es: 'Idiomas que Habla' },
    specializations: { en: 'Areas of Specialization', es: 'Áreas de Especialización' },
    
    // Certifications options
    certCHW: { en: 'Community Health Worker (CHW)', es: 'Trabajador de Salud Comunitaria (CHW)' },
    certDigitalLiteracy: { en: 'Digital Literacy Instructor', es: 'Instructor de Alfabetización Digital' },
    certAdultEducation: { en: 'Adult Education Certification', es: 'Certificación en Educación de Adultos' },
    certESL: { en: 'ESL/ESOL Certification', es: 'Certificación ESL/ESOL' },
    certTechTrainer: { en: 'Technology Trainer', es: 'Capacitador en Tecnología' },
    certHealthEducator: { en: 'Health Educator', es: 'Educador de Salud' },
    certOther: { en: 'Other', es: 'Otro' },
    
    // Availability
    availability: { en: 'Availability', es: 'Disponibilidad' },
    availableDays: { en: 'Available Days', es: 'Días Disponibles' },
    preferredTimes: { en: 'Preferred Times', es: 'Horarios Preferidos' },
    morning: { en: 'Morning (9 AM - 12 PM)', es: 'Mañana (9 AM - 12 PM)' },
    afternoon: { en: 'Afternoon (1 PM - 5 PM)', es: 'Tarde (1 PM - 5 PM)' },
    evening: { en: 'Evening (6 PM - 9 PM)', es: 'Noche (6 PM - 9 PM)' },
    
    // Background
    background: { en: 'Background & Experience', es: 'Antecedentes y Experiencia' },
    teachingExperience: { en: 'Describe your teaching experience', es: 'Describa su experiencia docente' },
    whyInterested: { en: 'Why are you interested in teaching digital literacy?', es: '¿Por qué le interesa enseñar alfabetización digital?' },
    
    // Review & Submit
    review: { en: 'Review & Submit', es: 'Revisar y Enviar' },
    reviewInstructions: { 
      en: 'Please review your information before submitting.', 
      es: 'Por favor revise su información antes de enviar.' 
    },
    submit: { en: 'Submit Application', es: 'Enviar Solicitud' },
    submitting: { en: 'Submitting...', es: 'Enviando...' },
    
    // Success
    applicationSubmitted: { 
      en: 'APPLICATION SUBMITTED', 
      es: 'SOLICITUD ENVIADA' 
    },
    thankYouApplying: {
      en: 'Thank you for applying to be an instructor! We will review your application and contact you within 5-7 business days.',
      es: '¡Gracias por aplicar para ser instructor! Revisaremos su solicitud y lo contactaremos dentro de 5-7 días hábiles.'
    },
  },
  
  // Email
  email: {
    subject: { 
      en: 'Registration Confirmed - Digital Literacy Program', 
      es: 'Registro Confirmado - Programa de Alfabetización Digital' 
    },
    dear: { en: 'Dear', es: 'Estimado/a' },
    thankYouRegistering: {
      en: 'Thank you for registering for the Digital Literacy Program!',
      es: '¡Gracias por registrarse en el Programa de Alfabetización Digital!'
    },
    yourDetails: { en: 'Your Registration Details:', es: 'Detalles de su Registro:' },
    lookForward: { 
      en: 'We look forward to seeing you in class!', 
      es: '¡Esperamos verlo/a en clase!' 
    },
    questionsContact: { en: 'Questions?', es: '¿Preguntas?' },
    contactUs: { en: 'Contact us at', es: 'Contáctenos en' },
  },
};

// Helper function to get translation
export function t(
  key: string, 
  lang: Language, 
  translations: any = TRANSLATIONS
): string {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (value && typeof value === 'object' && lang in value) {
    return value[lang];
  }
  
  return key;
}

// Helper to get bilingual text (both languages)
export function tBilingual(key: string, translations: any = TRANSLATIONS): string {
  const en = t(key, 'en', translations);
  const es = t(key, 'es', translations);
  return `${en} | ${es}`;
}

// Get topic name by code
export function getTopicName(code: string, lang: Language): string {
  const topic = COURSE_TOPICS.find(t => t.code === code);
  return topic ? topic[lang] : code;
}

// Get proficiency level info
export function getProficiencyInfo(id: string, lang: Language) {
  const level = PROFICIENCY_LEVELS.find(l => l.id === id);
  if (!level) return null;
  return {
    name: level[lang],
    color: level.color,
    description: lang === 'en' ? level.descEn : level.descEs
  };
}

// Get class schedule text
export function getClassSchedule(classId: string, lang: Language): string {
  const schedule = CLASS_SCHEDULES.find(s => s.id === classId);
  return schedule ? schedule[lang] : classId;
}

// Get county name
export function getCountyName(countyId: string, lang: Language): string {
  const county = COUNTIES.find(c => c.id === countyId);
  return county ? county[lang] : countyId;
}
