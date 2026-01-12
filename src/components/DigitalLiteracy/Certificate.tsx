'use client';

import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Student } from './StudentCard';

interface CertificateProps {
  student: Student;
  instructorName: string;
  programDirector: string;
  startDate: string;
  endDate: string;
  onClose: () => void;
}

export default function Certificate({
  student,
  instructorName,
  programDirector,
  startDate,
  endDate,
  onClose,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // Calculate attendance percentage
  const attendancePercent = student.attendance.total > 0 
    ? Math.round((student.attendance.present / student.attendance.total) * 100)
    : 0;
  
  // Count proficient or mastery topics
  const proficientTopics = Object.values(student.proficiencyAssessments).filter(
    a => a.level === 'proficient' || a.level === 'mastery'
  ).length;
  
  // Generate certificate number
  const certNumber = `CERT-${new Date().getFullYear()}-${student.id.toUpperCase().slice(0, 4)}`;

  const handlePrint = () => {
    const printContent = certificateRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${student.name}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
            }
            .certificate {
              background: white;
              border: 8px double #1976d2;
              padding: 40px;
              max-width: 800px;
              text-align: center;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 24px;
              color: #1565c0;
              margin-bottom: 30px;
            }
            .certifies {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            .name {
              font-size: 36px;
              font-weight: bold;
              color: #333;
              margin: 20px 0;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 10px;
            }
            .program {
              font-size: 20px;
              color: #1976d2;
              margin: 20px 0;
            }
            .details {
              font-size: 14px;
              color: #666;
              margin: 10px 0;
            }
            .signatures {
              display: flex;
              justify-content: space-around;
              margin-top: 40px;
            }
            .signature-block {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 200px;
              margin: 10px auto 5px;
            }
            .cert-number {
              font-size: 12px;
              color: #999;
              margin-top: 30px;
            }
            @media print {
              body { background: white; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">CERTIFICATE OF COMPLETION</div>
            <div class="subtitle">CERTIFICADO DE FINALIZACIÓN</div>
            
            <div class="certifies">This certifies that | Esto certifica que</div>
            
            <div class="name">${student.name}</div>
            
            <div class="certifies">has successfully completed | ha completado exitosamente el</div>
            
            <div class="program">
              Digital Literacy Program<br>
              Programa de Alfabetización Digital
            </div>
            
            <div class="details">
              Six-Week Course | Curso de Seis Semanas<br>
              ${startDate} - ${endDate}
            </div>
            
            <div class="details">
              Attendance | Asistencia: ${attendancePercent}%<br>
              Proficiency Achievement | Logro de Competencia:<br>
              ${proficientTopics} topics at Proficient or Mastery level<br>
              ${proficientTopics} temas a nivel Competente o Dominio
            </div>
            
            <div class="signatures">
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>${instructorName}</div>
                <div style="font-size: 12px; color: #666;">Instructor | Instructor</div>
              </div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <div>${programDirector}</div>
                <div style="font-size: 12px; color: #666;">Program Director | Director del Programa</div>
              </div>
            </div>
            
            <div class="cert-number">
              Certificate No. | Certificado No.: ${certNumber}
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 justify-end">
        <Button variant="outline" onClick={onClose}>
          Close | Cerrar
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print | Imprimir
        </Button>
      </div>

      {/* Certificate Preview */}
      <Card 
        ref={certificateRef}
        className="border-8 border-double border-blue-600 max-w-[800px] mx-auto"
      >
        <CardContent className="p-10 text-center">
          {/* Title */}
          <h1 className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Georgia, serif' }}>
            CERTIFICATE OF COMPLETION
          </h1>
          <h2 className="text-2xl text-blue-700 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
            CERTIFICADO DE FINALIZACIÓN
          </h2>

          {/* Certifies */}
          <p className="text-muted-foreground mb-2">
            This certifies that | Esto certifica que
          </p>

          {/* Student Name */}
          <h2 
            className="text-4xl font-bold my-6 pb-4 border-b-2 border-blue-600"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {student.name}
          </h2>

          {/* Has Completed */}
          <p className="text-muted-foreground mb-2">
            has successfully completed | ha completado exitosamente el
          </p>

          {/* Program Name */}
          <h3 
            className="text-xl text-blue-600 my-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Digital Literacy Program<br />
            Programa de Alfabetización Digital
          </h3>

          {/* Course Details */}
          <p className="text-muted-foreground">
            Six-Week Course | Curso de Seis Semanas
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {startDate} - {endDate}
          </p>

          <hr className="my-6" />

          {/* Achievement Details */}
          <div className="mb-8">
            <p>
              <strong>Attendance | Asistencia:</strong> {attendancePercent}%
            </p>
            <p>
              <strong>Proficiency Achievement | Logro de Competencia:</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              {proficientTopics} topics at Proficient or Mastery level
            </p>
            <p className="text-sm text-muted-foreground">
              {proficientTopics} temas a nivel Competente o Dominio
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-around mt-10">
            <div className="text-center">
              <div className="border-t border-gray-800 w-[200px] mx-auto mb-2" />
              <p className="font-medium">{instructorName}</p>
              <p className="text-xs text-muted-foreground">Instructor | Instructor</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-800 w-[200px] mx-auto mb-2" />
              <p className="font-medium">{programDirector}</p>
              <p className="text-xs text-muted-foreground">Program Director | Director del Programa</p>
            </div>
          </div>

          {/* Certificate Number */}
          <p className="text-xs text-muted-foreground mt-8">
            Certificate No. | Certificado No.: {certNumber}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
