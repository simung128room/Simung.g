import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, KeyRound } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import Modal from '../components/Modal';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });
  const navigate = useNavigate();

  // Google's official test site key (always passes). 
  // In production, users should replace this with their real site key.
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError('กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ (reCAPTCHA)');
      return;
    }
    setError('');
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // ส่งอีเมลยืนยันตัวตน (Real Email Verification)
        await sendEmailVerification(userCredential.user);
        setModalState({ 
          isOpen: true, 
          type: 'success', 
          message: 'สมัครสมาชิกสำเร็จ! ระบบได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ' 
        });
        // ไม่นำทางไปหน้าหลักจนกว่าจะกดยืนยันในอีเมล (แต่ Firebase จะล็อกอินให้อัตโนมัติ เราสามารถเช็ค emailVerified ใน App.tsx ได้)
        setTimeout(() => navigate('/'), 3000);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setModalState({ 
            isOpen: true, 
            type: 'error', 
            message: 'กรุณายืนยันอีเมลของคุณก่อนเข้าใช้งาน (ตรวจสอบในกล่องข้อความหรือโฟลเดอร์ขยะ)' 
          });
          // สามารถเลือกที่จะไม่ให้เข้าใช้งาน หรือให้เข้าแต่เตือนได้ (ในที่นี้เราจะให้เข้าแต่เตือนใน Navbar)
        }
        navigate('/');
      }
    } catch (err: any) {
      // แปลงข้อความ Error ของ Firebase ให้อ่านง่ายขึ้น
      let errorMsg = err.message;
      if (err.code === 'auth/email-already-in-use') errorMsg = 'อีเมลนี้ถูกใช้งานแล้ว';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') errorMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      if (err.code === 'auth/weak-password') errorMsg = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      setError(errorMsg);
    }
  };

  const handleGoogleLogin = async () => {
    if (!recaptchaToken) {
      setError('กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ (reCAPTCHA)');
      return;
    }
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('กรุณากรอกอีเมลในช่องด้านบนเพื่อรับลิงก์รีเซ็ตรหัสผ่าน');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ' 
      });
    } catch (err: any) {
      let errorMsg = err.message;
      if (err.code === 'auth/user-not-found') errorMsg = 'ไม่พบบัญชีที่ใช้อีเมลนี้';
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isRegistering ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
          </h1>
          <p className="mt-2 text-indigo-100 font-medium">ระบบตัดเกรดและจัดตารางผลการเรียน</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg font-bold text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  placeholder="teacher@school.ac.th"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-700">{t('password')}</label>
                {!isRegistering && (
                  <button 
                    type="button" 
                    onClick={handleResetPassword}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {/* Real Google reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isRegistering ? <UserPlus className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isRegistering ? 'สมัครสมาชิก' : t('login')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-bold">หรือ</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-extrabold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t('login_google')}
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold text-sm"
            >
              {isRegistering ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
            </button>
          </div>
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
