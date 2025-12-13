# Fiesta Family Services - Digital Literacy Training Form

## Form Overview

**Form Name:** Navegando el Mundo Digital - Student Tracking Form  
**Languages:** English & Spanish (Bilingual)  
**Purpose:** Single unified form to track student registration, attendance across all 6 classes, progress, and completion  
**Target Counties:** Moore County, Montgomery County (NC)

---

## QR Code Self-Check-In Feature

### Overview
Students can sign into each class by scanning a QR code with their smartphone. This provides a contactless, efficient way to track attendance.

### How It Works

1. **Instructor Setup (Before Class)**
   - Instructor opens the class attendance page in CHWOne
   - Clicks "Generate Class QR Code" for the specific class (1-6)
   - Displays QR code on screen or prints it for the classroom

2. **Student Check-In (During Class)**
   - Student scans QR code with smartphone camera
   - Opens a mobile-friendly check-in page
   - Student enters their registered email or phone number
   - System looks up their record and marks them present
   - Confirmation message displays: "✓ You're checked in for Class X"

3. **Automatic Recording**
   - Timestamp automatically recorded
   - Student's attendance record updated in real-time
   - Instructor sees live attendance count on their dashboard

### QR Code Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Class-Specific QR** | Unique QR for each class session | Display at start of each class |
| **Student-Specific QR** | Unique QR per student | Student shows QR, instructor scans |
| **Universal Check-In QR** | Single QR, student selects class | Permanent poster in classroom |

### Mobile Check-In Page Features

- **Auto-detect language** based on phone settings (English/Spanish)
- **Simple interface** - just email/phone lookup
- **Offline support** - queues check-in if no internet, syncs when connected
- **Confirmation screen** with class details and timestamp
- **Error handling** - "Email not found" prompts registration link

### Security Features

- QR codes can be **time-limited** (valid only during class hours)
- **Location verification** (optional) - GPS check to ensure student is at venue
- **Duplicate prevention** - Can't check in twice for same class
- **Audit trail** - All check-ins logged with device info

---

## Form Structure

### Section 1: General Information (Información General)

| Field | Type | Options/Validation | Required |
|-------|------|-------------------|----------|
| Registration Date (Fecha de Registro) | Date Picker | Auto-fill current date | Yes |
| Student Name (Nombre del Estudiante) | Text (Full Name) | - | Yes |
| Email (Correo Electrónico) | Email | Email validation | Yes |
| Phone Number (Número de Teléfono) | Phone | Phone format validation | Yes |
| County of Residence (Condado de Residencia) | Dropdown | Moore County, Montgomery County | Yes |

---

### Section 2: Class Attendance (Asistencia a Clases)

**Design:** Two attendance options:
1. **Instructor marks present** - Click "Mark Present" button to timestamp attendance
2. **Student self-check-in** - Student scans QR code with smartphone

**QR Code Check-In Flow:**
```
[QR Code Scanned] → [Mobile Page Opens] → [Student Enters Email/Phone] → [System Finds Record] → [Marks Present + Timestamp] → [Confirmation]
```

#### Class 1 (Clase 1)
- **Unidad 1:** Introducción a Navegando el Mundo Digital
- **Unidad 2:** Conociendo las computadoras y Dispositivos móviles

| Field | Type | Description |
|-------|------|-------------|
| Class 1 Attended | Button + Timestamp | "Mark Present" button stamps date/time |
| Class 1 Date | Auto-generated | Timestamp when button clicked |
| Class 1 Instructor Notes | Text (Optional) | Notes field |

#### Class 2 (Clase 2)
- **Unidad 3:** Habilidades Básicas de Internet
- **Unidad 4:** Correo Electrónico y comunicación

| Field | Type | Description |
|-------|------|-------------|
| Class 2 Attended | Button + Timestamp | "Mark Present" button stamps date/time |
| Class 2 Date | Auto-generated | Timestamp when button clicked |
| Class 2 Instructor Notes | Text (Optional) | Notes field |

#### Class 3 (Clase 3)
- **Unidad 5:** Conceptos Básicos de Redes Sociales
- **Unidad 6:** Utilización de Servicios en Línea

| Field | Type | Description |
|-------|------|-------------|
| Class 3 Attended | Button + Timestamp | "Mark Present" button stamps date/time |
| Class 3 Date | Auto-generated | Timestamp when button clicked |
| Class 3 Instructor Notes | Text (Optional) | Notes field |

#### Class 4 (Clase 4)
- **Unidad 7:** Creación de Contenido Digital con Google Suite
- **Unidad 8:** Herramientas Digitales para la Vida Diaria

| Field | Type | Description |
|-------|------|-------------|
| Class 4 Attended | Button + Timestamp | "Mark Present" button stamps date/time |
| Class 4 Date | Auto-generated | Timestamp when button clicked |
| Class 4 Instructor Notes | Text (Optional) | Notes field |

#### Class 5 (Clase 5)
- **Unidad 9:** Seguridad y Privacidad en Línea
- **Unidad 10:** Revisión del Curso y Aplicaciones Prácticas

| Field | Type | Description |
|-------|------|-------------|
| Class 5 Attended | Button + Timestamp | "Mark Present" button stamps date/time |
| Class 5 Date | Auto-generated | Timestamp when button clicked |
| Class 5 Instructor Notes | Text (Optional) | Notes field |

#### Class 6 (Clase 6)
- **Entrega de Dispositivo digital** (Digital Device Delivery)

| Field | Type | Description |
|-------|------|-------------|
| Class 6 Attended | Button + Timestamp | "Mark Present" button stamps date/time |
| Class 6 Date | Auto-generated | Timestamp when button clicked |
| Device Delivered | Checkbox | Confirm device was delivered |
| Class 6 Instructor Notes | Text (Optional) | Notes field |

---

### Section 3: Student Progress (Progreso del Estudiante)

**Design:** Simple checkbox list for tracking student progress through units.

| Field | Type | Description |
|-------|------|-------------|
| Unit 1 Complete | Checkbox | Introducción a Navegando el Mundo Digital |
| Unit 2 Complete | Checkbox | Conociendo las computadoras y Dispositivos móviles |
| Unit 3 Complete | Checkbox | Habilidades Básicas de Internet |
| Unit 4 Complete | Checkbox | Correo Electrónico y comunicación |
| Unit 5 Complete | Checkbox | Conceptos Básicos de Redes Sociales |
| Unit 6 Complete | Checkbox | Utilización de Servicios en Línea |
| Unit 7 Complete | Checkbox | Creación de Contenido Digital con Google Suite |
| Unit 8 Complete | Checkbox | Herramientas Digitales para la Vida Diaria |
| Unit 9 Complete | Checkbox | Seguridad y Privacidad en Línea |
| Unit 10 Complete | Checkbox | Revisión del Curso y Aplicaciones Prácticas |

---

### Section 4: Completion (Finalización)

| Field | Type | Options/Validation | Required |
|-------|------|-------------------|----------|
| Course Completed | Checkbox | Yes/No | Yes |
| Date Completed (Fecha de Finalización) | Date Picker | - | Conditional (if completed) |
| Incomplete Reason (Razón de No Completar) | Dropdown | See options below | Conditional (if not completed) |
| Incomplete Reason - Other | Text Area | Free text description | Conditional (if "Other" selected) |
| Date Student Received Tablet | Date Picker | - | Conditional |
| Tablet Serial Number | Text | Device tracking | Optional |

**Incomplete Reason Dropdown Options:**
- Schedule conflict (Conflicto de horario)
- Transportation issues (Problemas de transporte)
- Health reasons (Razones de salud)
- Family emergency (Emergencia familiar)
- Moved out of area (Se mudó fuera del área)
- Lost interest (Perdió interés)
- Work conflict (Conflicto de trabajo)
- Childcare issues (Problemas de cuidado de niños)
- Other (Otro) - triggers text area

---

## Dataset Structure

The form will automatically create a dataset with the following fields:

```typescript
interface FiestaFamilyStudent {
  // General Information
  id: string;
  registrationDate: Date;
  studentName: string;
  email: string;
  phoneNumber: string;
  countyOfResidence: 'Moore County' | 'Montgomery County';
  
  // Class Attendance (each has attended boolean + timestamp)
  class1Attended: boolean;
  class1Date: Date | null;
  class1Notes: string;
  
  class2Attended: boolean;
  class2Date: Date | null;
  class2Notes: string;
  
  class3Attended: boolean;
  class3Date: Date | null;
  class3Notes: string;
  
  class4Attended: boolean;
  class4Date: Date | null;
  class4Notes: string;
  
  class5Attended: boolean;
  class5Date: Date | null;
  class5Notes: string;
  
  class6Attended: boolean;
  class6Date: Date | null;
  class6DeviceDelivered: boolean;
  class6Notes: string;
  
  // Progress Tracking
  unit1Complete: boolean;
  unit2Complete: boolean;
  unit3Complete: boolean;
  unit4Complete: boolean;
  unit5Complete: boolean;
  unit6Complete: boolean;
  unit7Complete: boolean;
  unit8Complete: boolean;
  unit9Complete: boolean;
  unit10Complete: boolean;
  
  // Completion
  courseCompleted: boolean;
  dateCompleted: Date | null;
  incompleteReason: string | null;
  incompleteReasonOther: string | null;
  dateReceivedTablet: Date | null;
  tabletSerialNumber: string | null;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}
```

---

## UI/UX Features

### Attendance Button Behavior
When Karina clicks "Mark Present" for a class:
1. Button changes from "Mark Present" to "✓ Present - [Date/Time]"
2. Timestamp is automatically recorded
3. Button becomes disabled (can be reset by admin if needed)
4. Visual indicator shows green checkmark

### Progress Dashboard
- Visual progress bar showing % of units completed
- Color-coded attendance grid (green = attended, gray = not yet)
- Quick view of all students in a table format

### Bilingual Support
- All labels displayed in both English and Spanish
- Format: "English Label (Spanish Label)"
- Example: "Student Name (Nombre del Estudiante)"

---

## Integration with Collaboration Section

This form should be linked to the **Fiesta Family Services** collaboration/grant in the system:

1. **Collaboration Link:** Form is associated with Fiesta Family Services grant
2. **Reporting:** Data feeds into grant reporting dashboards
3. **Metrics Tracked:**
   - Total students registered
   - Attendance rate per class
   - Completion rate
   - Tablets distributed
   - Students by county

---

## Implementation Notes

### Form Builder Field Types to Use
- `date` - Date pickers
- `text` - Name, email fields
- `phone` - Phone number with validation
- `dropdown` - County selection, incomplete reasons
- `checkbox` - Progress tracking, completion status
- `button_timestamp` - Attendance marking (custom field type)
- `textarea` - Notes and other descriptions

### Custom "Mark Present" Button
This requires a custom field type that:
1. Shows a button initially
2. On click, records current timestamp
3. Displays the timestamp and disables the button
4. Can be reset by admin users

### Conditional Logic
- "Date Completed" only shows if "Course Completed" is checked
- "Incomplete Reason" only shows if "Course Completed" is unchecked
- "Incomplete Reason - Other" only shows if "Other" is selected
- "Date Received Tablet" shows after Class 6 attendance is marked

---

## Spanish Translations

| English | Spanish |
|---------|---------|
| Registration Date | Fecha de Registro |
| Student Name | Nombre del Estudiante |
| Email | Correo Electrónico |
| Phone Number | Número de Teléfono |
| County of Residence | Condado de Residencia |
| Class Attendance | Asistencia a Clases |
| Mark Present | Marcar Presente |
| Student Progress | Progreso del Estudiante |
| Completion | Finalización |
| Course Completed | Curso Completado |
| Date Completed | Fecha de Finalización |
| Incomplete Reason | Razón de No Completar |
| Date Student Received Tablet | Fecha en que el Estudiante Recibió la Tableta |
| Unit Complete | Unidad Completada |
