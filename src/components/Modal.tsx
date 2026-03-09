import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'default';
}

export default function Modal({ isOpen, onClose, title, children, type = 'default' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className={`p-4 flex items-center justify-between border-b ${
                type === 'success' ? 'bg-green-50 border-green-100' :
                type === 'error' ? 'bg-red-50 border-red-100' :
                'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center space-x-2">
                  {type === 'success' && <CheckCircle className="text-green-600 h-6 w-6" />}
                  {type === 'error' && <AlertCircle className="text-red-600 h-6 w-6" />}
                  <h2 className={`text-lg font-extrabold ${
                    type === 'success' ? 'text-green-800' :
                    type === 'error' ? 'text-red-800' :
                    'text-gray-900'
                  }`}>{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
