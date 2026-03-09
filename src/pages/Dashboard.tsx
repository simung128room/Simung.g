import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { subjects, students } = useStore();

  const totalStudents = students.length;
  const totalSubjects = subjects.length;
  
  // Calculate real average GPA based on students' grades
  const calculateAverageGPA = () => {
    if (students.length === 0) return "0.00";
    let totalScore = 0;
    let totalSubjects = 0;
    
    students.forEach(student => {
      Object.values(student.grades).forEach(grade => {
        const numGrade = parseFloat(grade);
        if (!isNaN(numGrade)) {
          totalScore += numGrade;
          totalSubjects += 1;
        }
      });
    });
    
    if (totalSubjects === 0) return "0.00";
    return (totalScore / totalSubjects).toFixed(2);
  };

  // Calculate passing rate (GPA >= 1.0)
  const calculatePassingRate = () => {
    if (students.length === 0) return "0%";
    let passedCount = 0;
    
    students.forEach(student => {
      let studentTotal = 0;
      let studentSubs = 0;
      Object.values(student.grades).forEach(grade => {
        const numGrade = parseFloat(grade);
        if (!isNaN(numGrade)) {
          studentTotal += numGrade;
          studentSubs += 1;
        }
      });
      const gpa = studentSubs > 0 ? studentTotal / studentSubs : 0;
      if (gpa >= 1.0) passedCount++;
    });
    
    return Math.round((passedCount / students.length) * 100) + "%";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-900">{t('dashboard')}</h1>
        <p className="mt-2 text-lg text-gray-600 font-medium">ยินดีต้อนรับสู่ระบบจัดการผลการเรียน</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4"
        >
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('students')}</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalStudents}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4"
        >
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('subjects')}</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalSubjects}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4"
        >
          <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">เกรดเฉลี่ยรวม</p>
            <p className="text-3xl font-extrabold text-gray-900">{calculateAverageGPA()}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4"
        >
          <div className="p-4 bg-rose-100 text-rose-600 rounded-xl">
            <Award size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">ผ่านเกณฑ์</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {calculatePassingRate()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
