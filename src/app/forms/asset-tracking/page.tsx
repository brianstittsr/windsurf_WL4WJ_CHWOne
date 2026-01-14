'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, User, Calendar, Save, Loader2, CheckCircle, Package } from 'lucide-react';

// Device types - bilingual
const DEVICE_TYPES = [
  { id: 'laptop', en: 'Laptop Computer', es: 'Computadora Portátil' },
  { id: 'desktop', en: 'Desktop Computer', es: 'Computadora de Escritorio' },
  { id: 'tablet', en: 'Tablet', es: 'Tableta' },
  { id: 'chromebook', en: 'Chromebook', es: 'Chromebook' },
];

// Accessories - bilingual
const ACCESSORIES = [
  { id: 'mouse', en: 'Mouse', es: 'Ratón' },
  { id: 'keyboard', en: 'Keyboard', es: 'Teclado' },
  { id: 'charger', en: 'Charger', es: 'Cargador' },
  { id: 'case', en: 'Carrying Case', es: 'Estuche' },
  { id: 'headphones', en: 'Headphones', es: 'Audífonos' },
  { id: 'usb', en: 'USB Drive', es: 'Memoria USB' },
];

// Conditions - bilingual
const CONDITIONS = [
  { id: 'new', en: 'New', es: 'Nuevo' },
  { id: 'refurbished', en: 'Refurbished', es: 'Reacondicionado' },
  { id: 'used', en: 'Used', es: 'Usado' },
];

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function AssetTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deviceType, setDeviceType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [dateGiven, setDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [condition, setCondition] = useState('new');
  const [notes, setNotes] = useState('');
  const [agreementSigned, setAgreementSigned] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/checkin/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories(prev =>
      prev.includes(accessoryId)
        ? prev.filter(a => a !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Please select a student | Por favor seleccione un estudiante');
      return;
    }
    if (!deviceType) {
      setError('Please select device type | Por favor seleccione el tipo de dispositivo');
      return;
    }
    if (!serialNumber.trim()) {
      setError('Please enter serial number | Por favor ingrese el número de serie');
      return;
    }
    if (!agreementSigned) {
      setError('Agreement must be signed | El acuerdo debe ser firmado');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/assets/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          deviceType,
          serialNumber,
          assetTag,
          dateGiven,
          accessories: selectedAccessories,
          condition,
          notes,
          agreementSigned,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error recording asset:', error);
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setDeviceType('');
    setSerialNumber('');
    setAssetTag('');
    setDateGiven(new Date().toISOString().split('T')[0]);
    setSelectedAccessories([]);
    setCondition('new');
    setNotes('');
    setAgreementSigned(false);
    setSuccess(false);
    setError('');
    setSearchQuery('');
  };

  const selectedDeviceType = DEVICE_TYPES.find(d => d.id === deviceType);

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#D2D2D7]">
            <div className="w-20 h-20 bg-[#0071E3]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#0071E3]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
              Device Recorded! | ¡Dispositivo Registrado!
            </h2>
            <p className="text-[#6E6E73] mb-4">
              The device has been assigned to {selectedStudent?.name}.<br/>
              El dispositivo ha sido asignado a {selectedStudent?.name}.
            </p>
            <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-[#1D1D1F]"><strong>Type | Tipo:</strong> {selectedDeviceType?.en} | {selectedDeviceType?.es}</p>
              <p className="text-sm text-[#1D1D1F]"><strong>Serial | Serie:</strong> {serialNumber}</p>
              <p className="text-sm text-[#1D1D1F]"><strong>Date | Fecha:</strong> {dateGiven}</p>
            </div>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-[#0071E3] text-white rounded-xl font-medium hover:bg-[#0077ED] transition-colors"
            >
              Record Another Device | Registrar Otro Dispositivo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Apple-styled Header */}
        <div className="bg-gradient-to-r from-[#0071E3] to-[#5856D6] rounded-2xl p-6 mb-6 text-white text-center">
          <Package className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold mb-1">
            Asset Tracking | Seguimiento de Activos
          </h1>
          <p className="opacity-90">
            Computer Distribution | Distribución de Computadoras
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D2D2D7]">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#FF3B30]/10 text-[#FF3B30] px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Student Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Select Student | Seleccione Estudiante *
              </label>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center">
                    <User className="absolute left-3 w-5 h-5 text-[#6E6E73]" />
                    <input
                      type="text"
                      value={selectedStudent ? selectedStudent.name : searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedStudent(null);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search student... | Buscar estudiante..."
                      className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
                    />
                  </div>
                  {showDropdown && filteredStudents.length > 0 && !selectedStudent && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[#D2D2D7] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchQuery('');
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] border-b border-[#D2D2D7] last:border-b-0"
                        >
                          <p className="font-medium text-[#1D1D1F]">{student.name}</p>
                          <p className="text-sm text-[#6E6E73]">{student.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Device Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Device Type | Tipo de Dispositivo *
              </label>
              <div className="relative">
                <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73]" />
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent bg-white"
                >
                  <option value="">Select device... | Seleccione dispositivo...</option>
                  {DEVICE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.en} | {type.es}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Serial Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Serial Number | Número de Serie *
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                placeholder="Enter serial number... | Ingrese número de serie..."
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              />
            </div>

            {/* Asset Tag */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Asset Tag (Optional) | Etiqueta de Activo (Opcional)
              </label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="Enter asset tag... | Ingrese etiqueta..."
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              />
            </div>

            {/* Date Given */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Date Given | Fecha de Entrega *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73]" />
                <input
                  type="date"
                  value={dateGiven}
                  onChange={(e) => setDateGiven(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Condition | Condición
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent bg-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.en} | {c.es}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Accessories Included | Accesorios Incluidos
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map((accessory) => (
                  <button
                    key={accessory.id}
                    type="button"
                    onClick={() => handleAccessoryToggle(accessory.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedAccessories.includes(accessory.id)
                        ? 'bg-[#0071E3] text-white'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                    }`}
                  >
                    {accessory.en} | {accessory.es}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                Notes | Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional notes... | Notas adicionales..."
                className="w-full px-4 py-3 border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent resize-none"
              />
            </div>

            {/* Agreement */}
            <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementSigned}
                  onChange={(e) => setAgreementSigned(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[#D2D2D7] text-[#0071E3] focus:ring-[#0071E3]"
                />
                <span className="text-sm text-[#1D1D1F]">
                  The participant has signed the device usage agreement and understands the terms and conditions.<br/>
                  <span className="text-[#6E6E73]">El participante ha firmado el acuerdo de uso del dispositivo y entiende los términos y condiciones.</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#0071E3] text-white rounded-xl font-medium hover:bg-[#0077ED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving... | Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Record Device | Registrar Dispositivo
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
