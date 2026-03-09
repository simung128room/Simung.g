import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "login": "Login",
      "email": "Email",
      "password": "Password",
      "login_google": "Login with Google",
      "dashboard": "Dashboard",
      "subjects": "Subjects",
      "students": "Students",
      "logout": "Logout",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "add_subject": "Add Subject",
      "subject_code": "Subject Code",
      "subject_name": "Subject Name",
      "import_csv": "Import CSV",
      "export_csv": "Export CSV",
      "download_template": "Download Template",
      "success": "Success",
      "error": "Error",
      "saved_successfully": "Saved successfully",
      "student_id": "Student ID",
      "student_name": "Student Name",
      "map_columns": "Map Columns",
      "confirm": "Confirm",
      "upload_success": "Upload successful",
    }
  },
  th: {
    translation: {
      "login": "เข้าสู่ระบบ",
      "email": "อีเมล",
      "password": "รหัสผ่าน",
      "login_google": "เข้าสู่ระบบด้วย Google",
      "dashboard": "แผงควบคุม",
      "subjects": "รายวิชา",
      "students": "นักเรียน",
      "logout": "ออกจากระบบ",
      "save": "บันทึก",
      "cancel": "ยกเลิก",
      "edit": "แก้ไข",
      "delete": "ลบ",
      "add_subject": "เพิ่มรายวิชา",
      "subject_code": "รหัสวิชา",
      "subject_name": "ชื่อวิชา",
      "import_csv": "นำเข้า CSV",
      "export_csv": "ส่งออก CSV",
      "download_template": "ดาวน์โหลดเทมเพลต",
      "success": "สำเร็จ",
      "error": "ข้อผิดพลาด",
      "saved_successfully": "บันทึกข้อมูลเรียบร้อยแล้ว",
      "student_id": "รหัสนักเรียน",
      "student_name": "ชื่อ-นามสกุล",
      "map_columns": "จับคู่คอลัมน์",
      "confirm": "ยืนยัน",
      "upload_success": "อัปโหลดสำเร็จ",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "th",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
