import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LogOut, BookOpen, Users, LayoutDashboard, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'th' ? 'en' : 'th');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-4 items-center overflow-x-auto no-scrollbar">
            <Link to="/" className="flex items-center space-x-2 font-bold text-lg hover:text-indigo-200 transition-colors">
              <LayoutDashboard size={20} />
              <span className="hidden sm:inline">{t('dashboard')}</span>
            </Link>
            <Link to="/subjects" className="flex items-center space-x-2 font-bold text-lg hover:text-indigo-200 transition-colors">
              <BookOpen size={20} />
              <span className="hidden sm:inline">{t('subjects')}</span>
            </Link>
            <Link to="/students" className="flex items-center space-x-2 font-bold text-lg hover:text-indigo-200 transition-colors">
              <Users size={20} />
              <span className="hidden sm:inline">{t('students')}</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleLanguage} className="flex items-center space-x-1 hover:text-indigo-200 font-bold transition-colors">
              <Globe size={20} />
              <span className="uppercase">{i18n.language}</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-indigo-200 font-bold transition-colors">
              <LogOut size={20} />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
