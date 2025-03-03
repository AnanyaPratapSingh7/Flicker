import React from 'react';
import { Toast as ToastType } from '../../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

const toastClasses = {
  success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  error: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`flex w-full max-w-md rounded-lg border-l-4 bg-white p-4 shadow-md dark:bg-gray-800 ${toastClasses[toast.type]}`}
    >
      <div className="mr-3 flex-shrink-0">{toastIcons[toast.type]}</div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">{toast.title}</h3>
        {toast.description && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 flex-shrink-0 rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:hover:bg-gray-700"
      >
        <X className="h-5 w-5 text-gray-400" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed right-0 top-0 z-50 flex flex-col items-end space-y-4 p-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { useToast } from '../../hooks/useToast';
