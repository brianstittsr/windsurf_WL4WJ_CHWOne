'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Grid,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import QRCode from 'react-qr-code';

// Class information for the Digital Literacy program
const CLASSES = [
  {
    id: 'class1',
    title: 'Class 1 / Clase 1',
    units: ['Unidad 1: Introducción a Navegando el Mundo Digital', 'Unidad 2: Conociendo las computadoras y Dispositivos móviles'],
  },
  {
    id: 'class2',
    title: 'Class 2 / Clase 2',
    units: ['Unidad 3: Habilidades Básicas de Internet', 'Unidad 4: Correo Electrónico y comunicación'],
  },
  {
    id: 'class3',
    title: 'Class 3 / Clase 3',
    units: ['Unidad 5: Conceptos Básicos de Redes Sociales', 'Unidad 6: Utilización de Servicios en Línea'],
  },
  {
    id: 'class4',
    title: 'Class 4 / Clase 4',
    units: ['Unidad 7: Creación de Contenido Digital con Google Suite', 'Unidad 8: Herramientas Digitales para la Vida Diaria'],
  },
  {
    id: 'class5',
    title: 'Class 5 / Clase 5',
    units: ['Unidad 9: Seguridad y Privacidad en Línea', 'Unidad 10: Revisión del Curso y Aplicaciones Prácticas'],
  },
  {
    id: 'class6',
    title: 'Class 6 / Clase 6',
    units: ['Entrega de Dispositivo digital (Digital Device Delivery)'],
  },
];

interface ClassQRCodeGeneratorProps {
  programId?: string;
  onClose?: () => void;
}

export default function ClassQRCodeGenerator({ programId, onClose }: ClassQRCodeGeneratorProps) {
  const [selectedClass, setSelectedClass] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const currentClass = CLASSES[selectedClass];
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chwone.com';
  const checkInUrl = `${baseUrl}/checkin/${currentClass.id}`;

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.fillStyle = 'white';
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0, 400, 400);

      const link = document.createElement('a');
      link.download = `fiesta_family_${currentClass.id}_qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      alert('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${currentClass.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
            }
            .header {
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1976d2;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
              margin-top: 8px;
            }
            .qr-container {
              margin: 30px auto;
              padding: 20px;
              border: 2px solid #1976d2;
              border-radius: 10px;
              display: inline-block;
            }
            .instructions {
              font-size: 16px;
              color: #333;
              margin-top: 20px;
            }
            .instructions-spanish {
              font-size: 14px;
              color: #666;
              font-style: italic;
            }
            .units {
              text-align: left;
              margin: 20px auto;
              max-width: 400px;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Navegando el Mundo Digital</div>
            <div class="subtitle">Fiesta Family Services - ${currentClass.title}</div>
          </div>
          
          <div class="qr-container">
            ${svgData}
          </div>
          
          <div class="instructions">
            <p><strong>Scan to Check In / Escanear para Registrarse</strong></p>
            <p>1. Open your phone camera / Abra la cámara de su teléfono</p>
            <p>2. Point at the QR code / Apunte al código QR</p>
            <p>3. Tap the link that appears / Toque el enlace que aparece</p>
            <p>4. Enter your email or phone / Ingrese su correo o teléfono</p>
          </div>
          
          <div class="units">
            <strong>Today's Topics / Temas de Hoy:</strong>
            <ul>
              ${currentClass.units.map(unit => `<li>${unit}</li>`).join('')}
            </ul>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<QrCodeIcon />}
        onClick={() => setShowDialog(true)}
        sx={{ mb: 2 }}
      >
        Generate Class QR Codes
      </Button>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">Class Check-In QR Codes</Typography>
          </Box>
          <IconButton onClick={() => setShowDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Class Tabs */}
          <Tabs
            value={selectedClass}
            onChange={(_, newValue) => setSelectedClass(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            {CLASSES.map((cls, index) => (
              <Tab key={cls.id} label={`Class ${index + 1}`} />
            ))}
          </Tabs>

          <Grid container spacing={3}>
            {/* QR Code Display */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {currentClass.title}
                  </Typography>
                  
                  <Box
                    ref={qrRef}
                    sx={{
                      display: 'inline-block',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '2px solid #1976d2',
                      my: 2,
                    }}
                  >
                    <QRCode
                      value={checkInUrl}
                      size={200}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                  </Box>

                  <Typography variant="caption" display="block" color="text.secondary">
                    {checkInUrl}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Tooltip title="Download QR Code">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={downloadQRCode}
                      >
                        Download
                      </Button>
                    </Tooltip>
                    <Tooltip title="Print QR Code">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={printQRCode}
                      >
                        Print
                      </Button>
                    </Tooltip>
                    <Tooltip title="Copy URL">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={copyUrl}
                      >
                        Copy URL
                      </Button>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Class Info & Instructions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Topics / Temas
                  </Typography>
                  {currentClass.units.map((unit, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {unit}
                    </Typography>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Instructions / Instrucciones
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>For Students:</strong>
                  </Typography>
                  <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                    <li>Open phone camera / Abra la cámara</li>
                    <li>Point at QR code / Apunte al código</li>
                    <li>Tap the link / Toque el enlace</li>
                    <li>Enter email or phone / Ingrese correo o teléfono</li>
                    <li>Tap "Check In" / Toque "Registrar"</li>
                  </Typography>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Students must be registered first to check in.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
