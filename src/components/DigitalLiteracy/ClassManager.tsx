'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit2, Trash2, Save, X, Calendar, Clock, Users, 
  CheckCircle, AlertCircle, Settings
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, orderBy, serverTimestamp 
} from 'firebase/firestore';

// Class interface for managing class definitions
export interface ClassDefinition {
  id: string;
  name: string;
  nameEs: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string;
  instructor?: string;
  maxCapacity: number;
  currentEnrollment: number;
  status: 'active' | 'inactive' | 'full';
  programId?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface ClassManagerProps {
  language?: 'en' | 'es';
  onClassSelect?: (classItem: ClassDefinition) => void;
  selectedClassId?: string;
}

const DAYS_OF_WEEK = [
  { value: 'Monday', en: 'Monday', es: 'Lunes' },
  { value: 'Tuesday', en: 'Tuesday', es: 'Martes' },
  { value: 'Wednesday', en: 'Wednesday', es: 'Miércoles' },
  { value: 'Thursday', en: 'Thursday', es: 'Jueves' },
  { value: 'Friday', en: 'Friday', es: 'Viernes' },
  { value: 'Saturday', en: 'Saturday', es: 'Sábado' },
];

const TIME_OPTIONS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
];

export default function ClassManager({ 
  language = 'en',
  onClassSelect,
  selectedClassId
}: ClassManagerProps) {
  const [classes, setClasses] = useState<ClassDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<ClassDefinition | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<ClassDefinition>>({
    name: '',
    nameEs: '',
    dayOfWeek: 'Monday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: '',
    instructor: '',
    maxCapacity: 20,
    status: 'active',
  });

  // Fetch classes from Firebase
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const classesRef = collection(db, 'digital_literacy_classes');
      const q = query(classesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Generate default classes if none exist
        await generateDefaultClasses();
      } else {
        const classesData: ClassDefinition[] = snapshot.docs.map(doc => ({
          id: doc.id,
          currentEnrollment: 0,
          ...doc.data(),
        } as ClassDefinition));
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Use default classes if Firebase fails
      setClasses(getDefaultClasses());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultClasses = (): ClassDefinition[] => {
    return [
      { id: 'class1', name: 'Class 1: Monday 10:00 AM - 12:00 PM', nameEs: 'Clase 1: Lunes 10:00 AM - 12:00 PM', dayOfWeek: 'Monday', startTime: '10:00 AM', endTime: '12:00 PM', maxCapacity: 20, currentEnrollment: 0, status: 'active' },
      { id: 'class2', name: 'Class 2: Monday 1:00 PM - 3:00 PM', nameEs: 'Clase 2: Lunes 1:00 PM - 3:00 PM', dayOfWeek: 'Monday', startTime: '1:00 PM', endTime: '3:00 PM', maxCapacity: 20, currentEnrollment: 0, status: 'active' },
      { id: 'class3', name: 'Class 3: Tuesday 10:00 AM - 12:00 PM', nameEs: 'Clase 3: Martes 10:00 AM - 12:00 PM', dayOfWeek: 'Tuesday', startTime: '10:00 AM', endTime: '12:00 PM', maxCapacity: 20, currentEnrollment: 0, status: 'active' },
      { id: 'class4', name: 'Class 4: Tuesday 1:00 PM - 3:00 PM', nameEs: 'Clase 4: Martes 1:00 PM - 3:00 PM', dayOfWeek: 'Tuesday', startTime: '1:00 PM', endTime: '3:00 PM', maxCapacity: 20, currentEnrollment: 0, status: 'active' },
      { id: 'class5', name: 'Class 5: Wednesday 10:00 AM - 12:00 PM', nameEs: 'Clase 5: Miércoles 10:00 AM - 12:00 PM', dayOfWeek: 'Wednesday', startTime: '10:00 AM', endTime: '12:00 PM', maxCapacity: 20, currentEnrollment: 0, status: 'active' },
      { id: 'class6', name: 'Class 6: Wednesday 1:00 PM - 3:00 PM', nameEs: 'Clase 6: Miércoles 1:00 PM - 3:00 PM', dayOfWeek: 'Wednesday', startTime: '1:00 PM', endTime: '3:00 PM', maxCapacity: 20, currentEnrollment: 0, status: 'active' },
    ];
  };

  const generateDefaultClasses = async () => {
    const defaultClasses = getDefaultClasses();
    
    try {
      for (const classItem of defaultClasses) {
        await setDoc(doc(db, 'digital_literacy_classes', classItem.id), {
          ...classItem,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setClasses(defaultClasses);
    } catch (error) {
      console.error('Error generating default classes:', error);
      setClasses(defaultClasses);
    }
  };

  // CREATE - Add new class
  const handleCreateClass = async () => {
    if (!formData.name) return;
    
    setSaving(true);
    try {
      const classId = `class-${Date.now()}`;
      const dayLabel = language === 'es' 
        ? DAYS_OF_WEEK.find(d => d.value === formData.dayOfWeek)?.es 
        : formData.dayOfWeek;
      
      const newClass: ClassDefinition = {
        id: classId,
        name: formData.name || `Class: ${formData.dayOfWeek} ${formData.startTime} - ${formData.endTime}`,
        nameEs: formData.nameEs || `Clase: ${dayLabel} ${formData.startTime} - ${formData.endTime}`,
        dayOfWeek: formData.dayOfWeek || 'Monday',
        startTime: formData.startTime || '10:00 AM',
        endTime: formData.endTime || '12:00 PM',
        location: formData.location,
        instructor: formData.instructor,
        maxCapacity: formData.maxCapacity || 20,
        currentEnrollment: 0,
        status: 'active',
      };

      await setDoc(doc(db, 'digital_literacy_classes', classId), {
        ...newClass,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setClasses([...classes, newClass].sort((a, b) => a.name.localeCompare(b.name)));
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setSaving(false);
    }
  };

  // UPDATE - Edit existing class
  const handleUpdateClass = async () => {
    if (!editingClass) return;
    
    setSaving(true);
    try {
      const updatedClass: ClassDefinition = {
        ...editingClass,
        name: formData.name || editingClass.name,
        nameEs: formData.nameEs || editingClass.nameEs,
        dayOfWeek: formData.dayOfWeek || editingClass.dayOfWeek,
        startTime: formData.startTime || editingClass.startTime,
        endTime: formData.endTime || editingClass.endTime,
        location: formData.location,
        instructor: formData.instructor,
        maxCapacity: formData.maxCapacity || editingClass.maxCapacity,
        status: formData.status as ClassDefinition['status'] || editingClass.status,
      };

      await updateDoc(doc(db, 'digital_literacy_classes', editingClass.id), {
        ...updatedClass,
        updatedAt: serverTimestamp(),
      });

      setClasses(classes.map(c => c.id === editingClass.id ? updatedClass : c));
      setEditingClass(null);
      resetForm();
    } catch (error) {
      console.error('Error updating class:', error);
    } finally {
      setSaving(false);
    }
  };

  // DELETE - Remove class
  const handleDeleteClass = async (classId: string) => {
    const classToDelete = classes.find(c => c.id === classId);
    if (!classToDelete) return;
    
    if (classToDelete.currentEnrollment > 0) {
      alert(language === 'en' 
        ? 'Cannot delete a class with enrolled students. Please remove students first.' 
        : 'No se puede eliminar una clase con estudiantes inscritos. Por favor, elimine los estudiantes primero.');
      return;
    }
    
    if (!confirm(language === 'en' 
      ? 'Are you sure you want to delete this class?' 
      : '¿Está seguro de que desea eliminar esta clase?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'digital_literacy_classes', classId));
      setClasses(classes.filter(c => c.id !== classId));
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEs: '',
      dayOfWeek: 'Monday',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      location: '',
      instructor: '',
      maxCapacity: 20,
      status: 'active',
    });
  };

  const startEditing = (classItem: ClassDefinition) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      nameEs: classItem.nameEs,
      dayOfWeek: classItem.dayOfWeek,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      location: classItem.location || '',
      instructor: classItem.instructor || '',
      maxCapacity: classItem.maxCapacity,
      status: classItem.status,
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      active: 'bg-[#34C759]/10 text-[#34C759]',
      inactive: 'bg-[#86868B]/10 text-[#86868B]',
      full: 'bg-[#FF9500]/10 text-[#FF9500]',
    };
    const labels: { [key: string]: { en: string; es: string } } = {
      active: { en: 'Active', es: 'Activo' },
      inactive: { en: 'Inactive', es: 'Inactivo' },
      full: { en: 'Full', es: 'Lleno' },
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
        {labels[status]?.[language] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071E3]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Class Selector Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium text-[#86868B] mb-1 block">
            {language === 'en' ? 'Current Class' : 'Clase Actual'}
          </Label>
          <Select 
            value={selectedClassId || ''} 
            onValueChange={(value) => {
              const selected = classes.find(c => c.id === value);
              if (selected && onClassSelect) onClassSelect(selected);
            }}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder={language === 'en' ? 'Select a class' : 'Seleccionar clase'} />
            </SelectTrigger>
            <SelectContent>
              {classes.filter(c => c.status === 'active').map(classItem => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {language === 'es' ? classItem.nameEs : classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowManagement(!showManagement)}
          className="mt-6"
        >
          <Settings className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Manage Classes' : 'Gestionar Clases'}
        </Button>
      </div>

      {/* Class Management Panel */}
      {showManagement && (
        <Card className="border-[#D2D2D7]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">
                {language === 'en' ? 'Class Management' : 'Gestión de Clases'}
              </h3>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-[#0071E3] hover:bg-[#0077ED] rounded-full px-4"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Add Class' : 'Agregar Clase'}
              </Button>
            </div>

            {/* Classes Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D2D2D7]">
                    <th className="text-left p-3 text-sm font-semibold text-[#1D1D1F]">
                      {language === 'en' ? 'Class Name' : 'Nombre de Clase'}
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-[#1D1D1F]">
                      {language === 'en' ? 'Day' : 'Día'}
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-[#1D1D1F]">
                      {language === 'en' ? 'Time' : 'Hora'}
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-[#1D1D1F]">
                      {language === 'en' ? 'Capacity' : 'Capacidad'}
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-[#1D1D1F]">
                      {language === 'en' ? 'Status' : 'Estado'}
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-[#1D1D1F]">
                      {language === 'en' ? 'Actions' : 'Acciones'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(classItem => (
                    <tr key={classItem.id} className="border-b border-[#F5F5F7] hover:bg-[#F5F5F7]/50">
                      <td className="p-3">
                        <span className="font-medium text-[#1D1D1F]">
                          {language === 'es' ? classItem.nameEs : classItem.name}
                        </span>
                      </td>
                      <td className="p-3 text-[#6E6E73]">
                        {language === 'es' 
                          ? DAYS_OF_WEEK.find(d => d.value === classItem.dayOfWeek)?.es 
                          : classItem.dayOfWeek}
                      </td>
                      <td className="p-3 text-[#6E6E73]">
                        {classItem.startTime} - {classItem.endTime}
                      </td>
                      <td className="p-3">
                        <span className={`text-sm ${classItem.currentEnrollment >= classItem.maxCapacity ? 'text-[#FF3B30]' : 'text-[#6E6E73]'}`}>
                          {classItem.currentEnrollment} / {classItem.maxCapacity}
                        </span>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(classItem.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(classItem)}
                            className="text-[#0071E3] hover:bg-[#0071E3]/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClass(classItem.id)}
                            className="text-[#FF3B30] hover:bg-[#FF3B30]/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      {(isCreating || editingClass) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-[#1D1D1F]">
                {isCreating 
                  ? (language === 'en' ? 'Add New Class' : 'Agregar Nueva Clase')
                  : (language === 'en' ? 'Edit Class' : 'Editar Clase')}
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setIsCreating(false); setEditingClass(null); resetForm(); }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{language === 'en' ? 'Class Name (English)' : 'Nombre de Clase (Inglés)'}</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Class 1: Monday 10:00 AM - 12:00 PM"
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Class Name (Spanish)' : 'Nombre de Clase (Español)'}</Label>
                <Input
                  value={formData.nameEs || ''}
                  onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
                  placeholder="ej., Clase 1: Lunes 10:00 AM - 12:00 PM"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Day of Week' : 'Día de la Semana'}</Label>
                  <Select 
                    value={formData.dayOfWeek} 
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {language === 'es' ? day.es : day.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{language === 'en' ? 'Max Capacity' : 'Capacidad Máxima'}</Label>
                  <Input
                    type="number"
                    value={formData.maxCapacity || 20}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 20 })}
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'en' ? 'Start Time' : 'Hora de Inicio'}</Label>
                  <Select 
                    value={formData.startTime} 
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{language === 'en' ? 'End Time' : 'Hora de Fin'}</Label>
                  <Select 
                    value={formData.endTime} 
                    onValueChange={(value) => setFormData({ ...formData, endTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{language === 'en' ? 'Location (Optional)' : 'Ubicación (Opcional)'}</Label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={language === 'en' ? 'e.g., Room 101' : 'ej., Sala 101'}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Instructor (Optional)' : 'Instructor (Opcional)'}</Label>
                <Input
                  value={formData.instructor || ''}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder={language === 'en' ? 'Instructor name' : 'Nombre del instructor'}
                />
              </div>

              {editingClass && (
                <div>
                  <Label>{language === 'en' ? 'Status' : 'Estado'}</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as ClassDefinition['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{language === 'en' ? 'Active' : 'Activo'}</SelectItem>
                      <SelectItem value="inactive">{language === 'en' ? 'Inactive' : 'Inactivo'}</SelectItem>
                      <SelectItem value="full">{language === 'en' ? 'Full' : 'Lleno'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#D2D2D7]">
              <Button
                variant="outline"
                onClick={() => { setIsCreating(false); setEditingClass(null); resetForm(); }}
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                onClick={isCreating ? handleCreateClass : handleUpdateClass}
                disabled={saving || !formData.name}
                className="bg-[#0071E3] hover:bg-[#0077ED]"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isCreating 
                  ? (language === 'en' ? 'Create Class' : 'Crear Clase')
                  : (language === 'en' ? 'Save Changes' : 'Guardar Cambios')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
