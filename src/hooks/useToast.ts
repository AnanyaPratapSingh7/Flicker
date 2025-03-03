import { useState } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const useToast = (): ToastContextValue => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...props,
    };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto dismiss after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
};
