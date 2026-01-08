'use client';

import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Student } from './StudentCard';
import { PROFICIENCY_LEVELS, COURSE_TOPICS } from '@/lib/translations/digitalLiteracy';

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
    <Box>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          Close | Cerrar
        </Button>
        <Button 
          variant="contained" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print | Imprimir
        </Button>
      </Box>

      {/* Certificate Preview */}
      <Card 
        ref={certificateRef}
        sx={{ 
          border: '8px double #1976d2',
          maxWidth: 800,
          mx: 'auto',
        }}
      >
        <CardContent sx={{ p: 5, textAlign: 'center' }}>
          {/* Title */}
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="primary"
            sx={{ fontFamily: 'Georgia, serif' }}
          >
            CERTIFICATE OF COMPLETION
          </Typography>
          <Typography 
            variant="h5" 
            color="primary.dark"
            sx={{ fontFamily: 'Georgia, serif', mb: 4 }}
          >
            CERTIFICADO DE FINALIZACIÓN
          </Typography>

          {/* Certifies */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            This certifies that | Esto certifica que
          </Typography>

          {/* Student Name */}
          <Typography 
            variant="h3" 
            fontWeight="bold"
            sx={{ 
              my: 3, 
              pb: 2, 
              borderBottom: '2px solid #1976d2',
              fontFamily: 'Georgia, serif',
            }}
          >
            {student.name}
          </Typography>

          {/* Has Completed */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            has successfully completed | ha completado exitosamente el
          </Typography>

          {/* Program Name */}
          <Typography 
            variant="h5" 
            color="primary"
            sx={{ my: 3, fontFamily: 'Georgia, serif' }}
          >
            Digital Literacy Program<br />
            Programa de Alfabetización Digital
          </Typography>

          {/* Course Details */}
          <Typography variant="body1" color="text.secondary">
            Six-Week Course | Curso de Seis Semanas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {startDate} - {endDate}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Achievement Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>Attendance | Asistencia:</strong> {attendancePercent}%
            </Typography>
            <Typography variant="body1">
              <strong>Proficiency Achievement | Logro de Competencia:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {proficientTopics} topics at Proficient or Mastery level
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {proficientTopics} temas a nivel Competente o Dominio
            </Typography>
          </Box>

          {/* Signatures */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 5 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ borderTop: '1px solid #333', width: 200, mx: 'auto', mb: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                {instructorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Instructor | Instructor
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ borderTop: '1px solid #333', width: 200, mx: 'auto', mb: 1 }} />
              <Typography variant="body1" fontWeight="medium">
                {programDirector}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Program Director | Director del Programa
              </Typography>
            </Box>
          </Box>

          {/* Certificate Number */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
            Certificate No. | Certificado No.: {certNumber}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
