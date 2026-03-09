import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, Subject } from '../store';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Modal from '../components/Modal';

export default function Subjects() {
  const { t } = useTranslation();
  const { subjects, setSubjects } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditCode(subject.code);
    setEditName(subject.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      const subjectRef = doc(db, 'users', auth.currentUser.uid, 'subjects', id);
      await setDoc(subjectRef, { code: editCode, name: editName }, { merge: true });
      
      const updatedSubjects = subjects.map(s => 
        s.id === id ? { ...s, code: editCode, name: editName } : s
      );
      setSubjects(updatedSubjects);
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
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'subjects', id));
      setSubjects(subjects.filter(s => s.id !== id));
      setModalState({ isOpen: true, type: 'success', message: t('saved_successfully') });
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', message: error.message });
    }
  };

  const handleAdd = async () => {
    if (!auth.currentUser || !newCode || !newName) return;
    try {
      const subjectsRef = collection(db, 'users', auth.currentUser.uid, 'subjects');
      const newDoc = doc(subjectsRef);
      const newSubject = { id: newDoc.id, code: newCode, name: newName };
      await setDoc(newDoc, { code: newCode, name: newName });
      
      setSubjects([...subjects, newSubject]);
      setIsAdding(false);
      setNewCode('');
      setNewName('');
      setModalState({ isOpen: true, type: 'success', message: t('saved_successfully') });
    } catch (error: any) {
      setModalState({ isOpen: true, type: 'error', message: error.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">{t('subjects')}</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">{t('add_subject')}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-500 uppercase tracking-wider">
                  {t('subject_code')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-500 uppercase tracking-wider">
                  {t('subject_name')}
                </th>
                <th className="px-6 py-4 text-right text-sm font-extrabold text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isAdding && (
                <tr className="bg-indigo-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium px-3 py-2 border"
                      placeholder="รหัสวิชา"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium px-3 py-2 border"
                      placeholder="ชื่อวิชา"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={handleAdd} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">
                      <Save size={20} />
                    </button>
                    <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700 font-bold">
                      <X size={20} />
                    </button>
                  </td>
                </tr>
              )}
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === subject.id ? (
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium px-3 py-2 border"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">{subject.code}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === subject.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium px-3 py-2 border"
                      />
                    ) : (
                      <span className="font-medium text-gray-700">{subject.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === subject.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(subject.id)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">
                          <Save size={20} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 font-bold">
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(subject)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900 font-bold">
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
