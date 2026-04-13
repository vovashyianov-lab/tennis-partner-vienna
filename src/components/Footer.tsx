import React from 'react';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-8 py-6 border-t border-tennis-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <a
              href="/legal/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 transition-colors"
            >
              Privacy Policy
            </a>
            <span>·</span>
            <a
              href="/legal/terms-of-service.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 transition-colors"
            >
              Terms of Service
            </a>
            <span>·</span>
            <a
              href="mailto:hello@tennispartner.at"
              className="inline-flex items-center gap-1 hover:text-gray-800 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact
            </a>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TennisPartner.at — Vienna
          </p>
        </div>
      </div>
    </footer>
  );
}
