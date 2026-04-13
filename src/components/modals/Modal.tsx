import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 30, 15, 0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 24px 64px rgba(26,58,26,0.18), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: '1px solid rgba(74,140,63,0.12)' }}>
          <h2 className="font-heading tracking-wide" style={{ fontSize: 20, color: 'var(--green-dark)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-tennis-700 hover:bg-tennis-50 active:scale-95 transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
