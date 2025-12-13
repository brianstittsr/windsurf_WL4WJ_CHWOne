/**
 * Fiesta Family Services - Digital Literacy Training Form Template
 * Navegando el Mundo Digital - Student Tracking Form
 * Bilingual: English & Spanish
 */

export const FIESTA_FAMILY_DIGITAL_LITERACY_FORM = {
  name: 'Fiesta Family Digital Literacy Training',
  nameSpanish: 'Navegando el Mundo Digital - Formulario de Seguimiento',
  description: 'Student registration, attendance tracking, progress monitoring, and completion form for the Digital Literacy Training program.',
  descriptionSpanish: 'Formulario de registro de estudiantes, seguimiento de asistencia, monitoreo de progreso y finalización para el programa de Capacitación en Alfabetización Digital.',
  category: 'training',
  tags: ['fiesta-family', 'digital-literacy', 'training', 'bilingual', 'attendance'],
  
  sections: [
    // Section 1: General Information
    {
      id: 'general-info',
      title: 'General Information',
      titleSpanish: 'Información General',
      description: 'Student registration details',
      fields: [
        {
          id: 'registration_date',
          type: 'date',
          label: 'Registration Date',
          labelSpanish: 'Fecha de Registro',
          required: true,
          defaultToToday: true,
        },
        {
          id: 'student_name',
          type: 'text',
          label: 'Student Name',
          labelSpanish: 'Nombre del Estudiante',
          required: true,
          placeholder: 'Enter full name / Ingrese nombre completo',
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          labelSpanish: 'Correo Electrónico',
          required: true,
          placeholder: 'email@example.com',
        },
        {
          id: 'phone_number',
          type: 'phone',
          label: 'Phone Number',
          labelSpanish: 'Número de Teléfono',
          required: true,
          placeholder: '(555) 555-5555',
        },
        {
          id: 'county_of_residence',
          type: 'select',
          label: 'County of Residence',
          labelSpanish: 'Condado de Residencia',
          required: true,
          options: [
            { value: 'moore', label: 'Moore County', labelSpanish: 'Condado de Moore' },
            { value: 'montgomery', label: 'Montgomery County', labelSpanish: 'Condado de Montgomery' },
          ],
        },
      ],
    },
    
    // Section 2: Class Attendance
    {
      id: 'class-attendance',
      title: 'Class Attendance',
      titleSpanish: 'Asistencia a Clases',
      description: 'Track attendance for each class session. Click "Mark Present" to record attendance with timestamp.',
      descriptionSpanish: 'Registre la asistencia para cada sesión de clase. Haga clic en "Marcar Presente" para registrar la asistencia con marca de tiempo.',
      fields: [
        // Class 1
        {
          id: 'class1_header',
          type: 'section-header',
          label: 'Class 1 (Clase 1)',
          description: 'Unidad 1: Introducción a Navegando el Mundo Digital\nUnidad 2: Conociendo las computadoras y Dispositivos móviles',
        },
        {
          id: 'class1_attended',
          type: 'checkbox',
          label: 'Class 1 Attended',
          labelSpanish: 'Clase 1 Asistió',
          required: false,
        },
        {
          id: 'class1_date',
          type: 'datetime',
          label: 'Class 1 Attendance Date/Time',
          labelSpanish: 'Fecha/Hora de Asistencia Clase 1',
          required: false,
          conditionalOn: 'class1_attended',
        },
        {
          id: 'class1_notes',
          type: 'textarea',
          label: 'Class 1 Instructor Notes',
          labelSpanish: 'Notas del Instructor Clase 1',
          required: false,
          placeholder: 'Optional notes / Notas opcionales',
        },
        
        // Class 2
        {
          id: 'class2_header',
          type: 'section-header',
          label: 'Class 2 (Clase 2)',
          description: 'Unidad 3: Habilidades Básicas de Internet\nUnidad 4: Correo Electrónico y comunicación',
        },
        {
          id: 'class2_attended',
          type: 'checkbox',
          label: 'Class 2 Attended',
          labelSpanish: 'Clase 2 Asistió',
          required: false,
        },
        {
          id: 'class2_date',
          type: 'datetime',
          label: 'Class 2 Attendance Date/Time',
          labelSpanish: 'Fecha/Hora de Asistencia Clase 2',
          required: false,
          conditionalOn: 'class2_attended',
        },
        {
          id: 'class2_notes',
          type: 'textarea',
          label: 'Class 2 Instructor Notes',
          labelSpanish: 'Notas del Instructor Clase 2',
          required: false,
          placeholder: 'Optional notes / Notas opcionales',
        },
        
        // Class 3
        {
          id: 'class3_header',
          type: 'section-header',
          label: 'Class 3 (Clase 3)',
          description: 'Unidad 5: Conceptos Básicos de Redes Sociales\nUnidad 6: Utilización de Servicios en Línea',
        },
        {
          id: 'class3_attended',
          type: 'checkbox',
          label: 'Class 3 Attended',
          labelSpanish: 'Clase 3 Asistió',
          required: false,
        },
        {
          id: 'class3_date',
          type: 'datetime',
          label: 'Class 3 Attendance Date/Time',
          labelSpanish: 'Fecha/Hora de Asistencia Clase 3',
          required: false,
          conditionalOn: 'class3_attended',
        },
        {
          id: 'class3_notes',
          type: 'textarea',
          label: 'Class 3 Instructor Notes',
          labelSpanish: 'Notas del Instructor Clase 3',
          required: false,
          placeholder: 'Optional notes / Notas opcionales',
        },
        
        // Class 4
        {
          id: 'class4_header',
          type: 'section-header',
          label: 'Class 4 (Clase 4)',
          description: 'Unidad 7: Creación de Contenido Digital con Google Suite\nUnidad 8: Herramientas Digitales para la Vida Diaria',
        },
        {
          id: 'class4_attended',
          type: 'checkbox',
          label: 'Class 4 Attended',
          labelSpanish: 'Clase 4 Asistió',
          required: false,
        },
        {
          id: 'class4_date',
          type: 'datetime',
          label: 'Class 4 Attendance Date/Time',
          labelSpanish: 'Fecha/Hora de Asistencia Clase 4',
          required: false,
          conditionalOn: 'class4_attended',
        },
        {
          id: 'class4_notes',
          type: 'textarea',
          label: 'Class 4 Instructor Notes',
          labelSpanish: 'Notas del Instructor Clase 4',
          required: false,
          placeholder: 'Optional notes / Notas opcionales',
        },
        
        // Class 5
        {
          id: 'class5_header',
          type: 'section-header',
          label: 'Class 5 (Clase 5)',
          description: 'Unidad 9: Seguridad y Privacidad en Línea\nUnidad 10: Revisión del Curso y Aplicaciones Prácticas',
        },
        {
          id: 'class5_attended',
          type: 'checkbox',
          label: 'Class 5 Attended',
          labelSpanish: 'Clase 5 Asistió',
          required: false,
        },
        {
          id: 'class5_date',
          type: 'datetime',
          label: 'Class 5 Attendance Date/Time',
          labelSpanish: 'Fecha/Hora de Asistencia Clase 5',
          required: false,
          conditionalOn: 'class5_attended',
        },
        {
          id: 'class5_notes',
          type: 'textarea',
          label: 'Class 5 Instructor Notes',
          labelSpanish: 'Notas del Instructor Clase 5',
          required: false,
          placeholder: 'Optional notes / Notas opcionales',
        },
        
        // Class 6
        {
          id: 'class6_header',
          type: 'section-header',
          label: 'Class 6 (Clase 6)',
          description: 'Entrega de Dispositivo digital (Digital Device Delivery)',
        },
        {
          id: 'class6_attended',
          type: 'checkbox',
          label: 'Class 6 Attended',
          labelSpanish: 'Clase 6 Asistió',
          required: false,
        },
        {
          id: 'class6_date',
          type: 'datetime',
          label: 'Class 6 Attendance Date/Time',
          labelSpanish: 'Fecha/Hora de Asistencia Clase 6',
          required: false,
          conditionalOn: 'class6_attended',
        },
        {
          id: 'class6_device_delivered',
          type: 'checkbox',
          label: 'Digital Device Delivered',
          labelSpanish: 'Dispositivo Digital Entregado',
          required: false,
          conditionalOn: 'class6_attended',
        },
        {
          id: 'class6_notes',
          type: 'textarea',
          label: 'Class 6 Instructor Notes',
          labelSpanish: 'Notas del Instructor Clase 6',
          required: false,
          placeholder: 'Optional notes / Notas opcionales',
        },
      ],
    },
    
    // Section 3: Student Progress
    {
      id: 'student-progress',
      title: 'Student Progress',
      titleSpanish: 'Progreso del Estudiante',
      description: 'Track completion of each unit',
      descriptionSpanish: 'Seguimiento de finalización de cada unidad',
      fields: [
        {
          id: 'unit1_complete',
          type: 'checkbox',
          label: 'Unit 1 Complete - Introducción a Navegando el Mundo Digital',
          labelSpanish: 'Unidad 1 Completada - Introducción a Navegando el Mundo Digital',
          required: false,
        },
        {
          id: 'unit2_complete',
          type: 'checkbox',
          label: 'Unit 2 Complete - Conociendo las computadoras y Dispositivos móviles',
          labelSpanish: 'Unidad 2 Completada - Conociendo las computadoras y Dispositivos móviles',
          required: false,
        },
        {
          id: 'unit3_complete',
          type: 'checkbox',
          label: 'Unit 3 Complete - Habilidades Básicas de Internet',
          labelSpanish: 'Unidad 3 Completada - Habilidades Básicas de Internet',
          required: false,
        },
        {
          id: 'unit4_complete',
          type: 'checkbox',
          label: 'Unit 4 Complete - Correo Electrónico y comunicación',
          labelSpanish: 'Unidad 4 Completada - Correo Electrónico y comunicación',
          required: false,
        },
        {
          id: 'unit5_complete',
          type: 'checkbox',
          label: 'Unit 5 Complete - Conceptos Básicos de Redes Sociales',
          labelSpanish: 'Unidad 5 Completada - Conceptos Básicos de Redes Sociales',
          required: false,
        },
        {
          id: 'unit6_complete',
          type: 'checkbox',
          label: 'Unit 6 Complete - Utilización de Servicios en Línea',
          labelSpanish: 'Unidad 6 Completada - Utilización de Servicios en Línea',
          required: false,
        },
        {
          id: 'unit7_complete',
          type: 'checkbox',
          label: 'Unit 7 Complete - Creación de Contenido Digital con Google Suite',
          labelSpanish: 'Unidad 7 Completada - Creación de Contenido Digital con Google Suite',
          required: false,
        },
        {
          id: 'unit8_complete',
          type: 'checkbox',
          label: 'Unit 8 Complete - Herramientas Digitales para la Vida Diaria',
          labelSpanish: 'Unidad 8 Completada - Herramientas Digitales para la Vida Diaria',
          required: false,
        },
        {
          id: 'unit9_complete',
          type: 'checkbox',
          label: 'Unit 9 Complete - Seguridad y Privacidad en Línea',
          labelSpanish: 'Unidad 9 Completada - Seguridad y Privacidad en Línea',
          required: false,
        },
        {
          id: 'unit10_complete',
          type: 'checkbox',
          label: 'Unit 10 Complete - Revisión del Curso y Aplicaciones Prácticas',
          labelSpanish: 'Unidad 10 Completada - Revisión del Curso y Aplicaciones Prácticas',
          required: false,
        },
      ],
    },
    
    // Section 4: Completion
    {
      id: 'completion',
      title: 'Completion',
      titleSpanish: 'Finalización',
      description: 'Course completion status and device delivery',
      descriptionSpanish: 'Estado de finalización del curso y entrega del dispositivo',
      fields: [
        {
          id: 'course_completed',
          type: 'checkbox',
          label: 'Course Completed',
          labelSpanish: 'Curso Completado',
          required: true,
        },
        {
          id: 'date_completed',
          type: 'date',
          label: 'Date Completed',
          labelSpanish: 'Fecha de Finalización',
          required: false,
          conditionalOn: 'course_completed',
          conditionalValue: true,
        },
        {
          id: 'incomplete_reason',
          type: 'select',
          label: 'Reason for Not Completing',
          labelSpanish: 'Razón de No Completar',
          required: false,
          conditionalOn: 'course_completed',
          conditionalValue: false,
          options: [
            { value: 'schedule_conflict', label: 'Schedule conflict', labelSpanish: 'Conflicto de horario' },
            { value: 'transportation', label: 'Transportation issues', labelSpanish: 'Problemas de transporte' },
            { value: 'health', label: 'Health reasons', labelSpanish: 'Razones de salud' },
            { value: 'family_emergency', label: 'Family emergency', labelSpanish: 'Emergencia familiar' },
            { value: 'moved', label: 'Moved out of area', labelSpanish: 'Se mudó fuera del área' },
            { value: 'lost_interest', label: 'Lost interest', labelSpanish: 'Perdió interés' },
            { value: 'work_conflict', label: 'Work conflict', labelSpanish: 'Conflicto de trabajo' },
            { value: 'childcare', label: 'Childcare issues', labelSpanish: 'Problemas de cuidado de niños' },
            { value: 'other', label: 'Other', labelSpanish: 'Otro' },
          ],
        },
        {
          id: 'incomplete_reason_other',
          type: 'textarea',
          label: 'Please describe the reason',
          labelSpanish: 'Por favor describa la razón',
          required: false,
          conditionalOn: 'incomplete_reason',
          conditionalValue: 'other',
          placeholder: 'Enter reason for not completing the course / Ingrese la razón por la que no completó el curso',
        },
        {
          id: 'date_received_tablet',
          type: 'date',
          label: 'Date Student Received Tablet',
          labelSpanish: 'Fecha en que el Estudiante Recibió la Tableta',
          required: false,
        },
        {
          id: 'tablet_serial_number',
          type: 'text',
          label: 'Tablet Serial Number',
          labelSpanish: 'Número de Serie de la Tableta',
          required: false,
          placeholder: 'Enter device serial number / Ingrese el número de serie del dispositivo',
        },
      ],
    },
  ],
  
  // Dataset configuration
  datasetConfig: {
    name: 'Fiesta Family Digital Literacy Students',
    description: 'Student records for the Digital Literacy Training program',
    fields: [
      // General Info
      { name: 'registration_date', type: 'date', label: 'Registration Date' },
      { name: 'student_name', type: 'string', label: 'Student Name' },
      { name: 'email', type: 'string', label: 'Email' },
      { name: 'phone_number', type: 'string', label: 'Phone Number' },
      { name: 'county_of_residence', type: 'string', label: 'County of Residence' },
      
      // Class Attendance
      { name: 'class1_attended', type: 'boolean', label: 'Class 1 Attended' },
      { name: 'class1_date', type: 'datetime', label: 'Class 1 Date' },
      { name: 'class2_attended', type: 'boolean', label: 'Class 2 Attended' },
      { name: 'class2_date', type: 'datetime', label: 'Class 2 Date' },
      { name: 'class3_attended', type: 'boolean', label: 'Class 3 Attended' },
      { name: 'class3_date', type: 'datetime', label: 'Class 3 Date' },
      { name: 'class4_attended', type: 'boolean', label: 'Class 4 Attended' },
      { name: 'class4_date', type: 'datetime', label: 'Class 4 Date' },
      { name: 'class5_attended', type: 'boolean', label: 'Class 5 Attended' },
      { name: 'class5_date', type: 'datetime', label: 'Class 5 Date' },
      { name: 'class6_attended', type: 'boolean', label: 'Class 6 Attended' },
      { name: 'class6_date', type: 'datetime', label: 'Class 6 Date' },
      { name: 'class6_device_delivered', type: 'boolean', label: 'Device Delivered' },
      
      // Progress
      { name: 'unit1_complete', type: 'boolean', label: 'Unit 1 Complete' },
      { name: 'unit2_complete', type: 'boolean', label: 'Unit 2 Complete' },
      { name: 'unit3_complete', type: 'boolean', label: 'Unit 3 Complete' },
      { name: 'unit4_complete', type: 'boolean', label: 'Unit 4 Complete' },
      { name: 'unit5_complete', type: 'boolean', label: 'Unit 5 Complete' },
      { name: 'unit6_complete', type: 'boolean', label: 'Unit 6 Complete' },
      { name: 'unit7_complete', type: 'boolean', label: 'Unit 7 Complete' },
      { name: 'unit8_complete', type: 'boolean', label: 'Unit 8 Complete' },
      { name: 'unit9_complete', type: 'boolean', label: 'Unit 9 Complete' },
      { name: 'unit10_complete', type: 'boolean', label: 'Unit 10 Complete' },
      
      // Completion
      { name: 'course_completed', type: 'boolean', label: 'Course Completed' },
      { name: 'date_completed', type: 'date', label: 'Date Completed' },
      { name: 'incomplete_reason', type: 'string', label: 'Incomplete Reason' },
      { name: 'incomplete_reason_other', type: 'string', label: 'Incomplete Reason (Other)' },
      { name: 'date_received_tablet', type: 'date', label: 'Date Received Tablet' },
      { name: 'tablet_serial_number', type: 'string', label: 'Tablet Serial Number' },
      
      // Metadata
      { name: 'created_at', type: 'datetime', label: 'Created At' },
      { name: 'updated_at', type: 'datetime', label: 'Updated At' },
      { name: 'created_by', type: 'string', label: 'Created By' },
    ],
  },
};

export default FIESTA_FAMILY_DIGITAL_LITERACY_FORM;
