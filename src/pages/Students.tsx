import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, Student } from '../store';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import Papa from 'papaparse';
import { motion } from 'motion/react';
import { Upload, Download, Save, Edit2, Trash2, Plus, FileSpreadsheet } from 'lucide-react';
import Modal from '../components/Modal';

export default function Students() {
  const { t } = useTranslation();
  const { subjects, students, setStudents } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isMapping, setIsMapping] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  const GRADE_OPTIONS = ['', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ข'];

  useEffect(() => {
    const loadStudents = async () => {
      if (!auth.currentUser) return;
      const studentsRef = collection(db, 'users', auth.currentUser.uid, 'students');
      const snapshot = await getDocs(studentsRef);
      const loadedStudents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(loadedStudents);
    };
    loadStudents();
  }, [setStudents]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          setCsvData(results.data);
          setCsvHeaders(Object.keys(results.data[0] as object));
          
          // Auto-map if names match
          const initialMap: Record<string, string> = {};
          Object.keys(results.data[0] as object).forEach(header => {
            if (header.toLowerCase().includes('id') || header.includes('รหัส')) {
              initialMap[header] = 'studentId';
            } else if (header.toLowerCase().includes('name') || header.includes('ชื่อ')) {
              initialMap[header] = 'name';
            } else {
              // Try to match with subject code or name
              const matchedSubj = subjects.find(s => s.code === header || s.name === header);
              if (matchedSubj) {
                initialMap[header] = matchedSubj.code;
              }
            }
          });
          setColumnMap(initialMap);
          setIsMapping(true);
        }
      },
      error: (error) => {
        setModalState({ isOpen: true, type: 'error', message: error.message });
      }
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportConfirm = async () => {
    if (!auth.currentUser) return;
    
    try {
      const batch = writeBatch(db);
      const newStudents: Student[] = [];
      const studentsRef = collection(db, 'users', auth.currentUser.uid, 'students');

      csvData.forEach((row) => {
        const studentData: any = { grades: {} };
        
        Object.entries(row).forEach(([header, value]) => {
          const mappedTo = columnMap[header];
          if (!mappedTo) return;
          
          if (mappedTo === 'studentId') studentData.studentId = value;
          else if (mappedTo === 'name') studentData.name = value;
          else studentData.grades[mappedTo] = value;
        });

        if (studentData.studentId && studentData.name) {
          const newDoc = doc(studentsRef);
          studentData.id = newDoc.id;
          batch.set(newDoc, studentData);
          newStudents.push(studentData as Student);
        }
      });

      await batch.commit();
      setStudents([...students, ...newStudents]);
      setIsMapping(false);
      setModalState({ isOpen: true, type: 'success', message: t('upload_success') });
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', message: error.message });
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['student_id', 'student_name', ...subjects.map(s => s.code)];
    const csv = Papa.unparse({
      fields: headers,
      data: [
        ['12345', 'นายสมชาย ใจดี', '4', '3.5', '...']
      ]
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template.csv';
    link.click();
  };

  const handleExport = () => {
    const headers = ['student_id', 'student_name', ...subjects.map(s => s.name)];
    const data = students.map(student => {
      const row: any = {
        student_id: student.studentId,
        student_name: student.name
      };
      subjects.forEach(sub => {
        row[sub.name] = student.grades[sub.code] || '';
      });
      return row;
    });

    const csv = Papa.unparse({ fields: headers, data });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students_grades.csv';
    link.click();
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData({ ...student, grades: { ...student.grades } });
  };

  const handleSaveEdit = async () => {
    if (!auth.currentUser || !editingId) return;
    try {
      const studentRef = doc(db, 'users', auth.currentUser.uid, 'students', editingId);
      await setDoc(studentRef, editData, { merge: true });
      
      const updatedStudents = students.map(s => 
        s.id === editingId ? (editData as Student) : s
      );
      setStudents(updatedStudents);
      setEditingId(null);
      setModalState({ isOpen: true, type: 'success', message: t('saved_successfully') });
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', message: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    if (!window.confirm(t('confirm') + ' ' + t('delete') + '?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'students', id));
      setStudents(students.filter(s => s.id !== id));
      setModalState({ isOpen: true, type: 'success', message: t('saved_successfully') });
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', message: error.message });
    }
  };

  const handleAddStudent = async () => {
    if (!auth.currentUser) return;
    try {
      const studentsRef = collection(db, 'users', auth.currentUser.uid, 'students');
      const newDoc = doc(studentsRef);
      const newStudent: Student = {
        id: newDoc.id,
        studentId: 'NEW' + Math.floor(Math.random() * 1000),
        name: 'นักเรียนใหม่',
        grades: {}
      };
      await setDoc(newDoc, newStudent);
      setStudents([...students, newStudent]);
      handleEdit(newStudent); // Auto enter edit mode
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', message: error.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-extrabold text-gray-900">{t('students')}</h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddStudent}
            className="flex items-center space-x-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">เพิ่มนักเรียน</span>
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={18} />
            <span className="hidden sm:inline">{t('download_template')}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">{t('import_csv')}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">{t('export_csv')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-32">
                  {t('student_id')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10 w-48">
                  {t('student_name')}
                </th>
                {subjects.map(sub => (
                  <th key={sub.id} className="px-4 py-3 text-center text-xs font-extrabold text-gray-500 uppercase tracking-wider min-w-[100px]">
                    <div className="truncate" title={sub.name}>{sub.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{sub.code}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 3} className="px-6 py-12 text-center text-gray-500 font-medium">
                    ไม่มีข้อมูลนักเรียน กรุณาเพิ่มหรือนำเข้าข้อมูล
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white group-hover:bg-indigo-50/30">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.studentId || ''}
                          onChange={(e) => setEditData({ ...editData, studentId: e.target.value })}
                          className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-bold px-2 py-1 border text-sm"
                        />
                      ) : (
                        <span className="font-extrabold text-gray-900">{student.studentId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap sticky left-32 bg-white group-hover:bg-indigo-50/30">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-bold px-2 py-1 border text-sm"
                        />
                      ) : (
                        <span className="font-bold text-gray-700">{student.name}</span>
                      )}
                    </td>
                    {subjects.map(sub => (
                      <td key={sub.id} className="px-4 py-3 whitespace-nowrap text-center">
                        {editingId === student.id ? (
                          <select
                            value={editData.grades?.[sub.code] || ''}
                            onChange={(e) => setEditData({
                              ...editData,
                              grades: { ...editData.grades, [sub.code]: e.target.value }
                            })}
                            className="w-16 text-center border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-bold px-1 py-1 border text-sm"
                          >
                            {GRADE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt || '-'}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md min-w-[2rem] inline-block">
                            {student.grades[sub.code] || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white group-hover:bg-indigo-50/30">
                      {editingId === student.id ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={handleSaveEdit} className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 p-1.5 rounded-lg">
                            <Save size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleEdit(student)} className="text-gray-500 hover:text-indigo-600 font-bold bg-gray-50 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(student.id)} className="text-gray-500 hover:text-red-600 font-bold bg-gray-50 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mapping Modal */}
      <Modal
        isOpen={isMapping}
        onClose={() => setIsMapping(false)}
        title={t('map_columns')}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-sm font-medium text-gray-600 mb-4">
            กรุณาจับคู่คอลัมน์จากไฟล์ CSV ให้ตรงกับข้อมูลในระบบ
          </p>
          {csvHeaders.map(header => (
            <div key={header} className="flex items-center justify-between space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-700 truncate w-1/2" title={header}>{header}</span>
              <select
                value={columnMap[header] || ''}
                onChange={(e) => setColumnMap({ ...columnMap, [header]: e.target.value })}
                className="w-1/2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-bold text-sm py-2 px-3 border"
              >
                <option value="">-- ไม่นำเข้า --</option>
                <option value="studentId">{t('student_id')}</option>
                <option value="name">{t('student_name')}</option>
                <optgroup label={t('subjects')}>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.code}>{sub.name} ({sub.code})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsMapping(false)}
            className="px-4 py-2 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleImportConfirm}
            className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {t('confirm')}
          </button>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.type === 'success' ? t('success') : t('error')}
        type={modalState.type}
      >
        <p className="text-gray-700 font-medium text-center">{modalState.message}</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setModalState({ ...modalState, isOpen: false })}
            className={`px-6 py-2 rounded-xl font-bold text-white shadow-sm transition-colors ${
              modalState.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {t('confirm')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
