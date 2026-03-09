import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { useStore } from './store';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { DEFAULT_SUBJECTS } from './constants';
import './i18n';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Students from './pages/Students';
import Navbar from './components/Navbar';

function App() {
  const { user, setUser, setSubjects } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load subjects
        const subjectsRef = collection(db, 'users', currentUser.uid, 'subjects');
        const snapshot = await getDocs(subjectsRef);
        
        if (snapshot.empty) {
          // Initialize default subjects
          const newSubjects = [];
          for (const sub of DEFAULT_SUBJECTS) {
            const newDoc = doc(subjectsRef);
            await setDoc(newDoc, sub);
            newSubjects.push({ id: newDoc.id, ...sub });
          }
          setSubjects(newSubjects);
        } else {
          const loadedSubjects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];
          setSubjects(loadedSubjects);
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setSubjects]);

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/subjects" element={user ? <Subjects /> : <Navigate to="/login" />} />
          <Route path="/students" element={user ? <Students /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
