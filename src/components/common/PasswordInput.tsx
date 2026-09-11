import React, { useState } from 'react';
import { Eye, EyeOff, Wand2, Check, X, Copy, CheckCircle2 } from 'lucide-react';
import { calculatePasswordStrength, generateSecurePassword } from '../../utils/passwordValidation';

interface PasswordInputProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: 'new-password' | 'current-password';
  showStrengthMeter?: boolean;
  showGenerator?: boolean;
  onGeneratePassword?: (password: string) => void;
  emailForValidation?: string;
  lang?: 'de' | 'en';
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
}

export default function PasswordInput({
  id,
  name = id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'new-password',
  showStrengthMeter = false,
  showGenerator = false,
  onGeneratePassword,
  emailForValidation,
  lang = 'de',
  disabled = false,
  required = true,
  className = '',
  error
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDe = lang === 'de';

  const strength = calculatePasswordStrength(value, emailForValidation, lang);

  const handleGenerate = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newPwd = generateSecurePassword(16);
    onChange(newPwd);
    setShowPassword(true); // Automatically reveal so user can see what was generated

    if (onGeneratePassword) {
      onGeneratePassword(newPwd);
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(newPwd).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {});
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold leading-6 text-slate-700 dark:text-[#fafafa]">
          {label}
        </label>

        {showGenerator && (
          <button
            type="button"
            data-testid="generate-password-btn"
            onClick={handleGenerate}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all cursor-pointer group py-1 px-2.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 shadow-xs"
            title={isDe ? 'Generiert ein starkes, sicheres 16-stelliges Passwort' : 'Generates a strong, secure 16-character password'}
          >
            <Wand2 size={13} className="text-blue-500 group-hover:rotate-12 transition-transform" />
            <span>{copied ? (isDe ? 'Kopiert!' : 'Copied!') : (isDe ? 'Sicheres Passwort generieren' : 'Generate secure password')}</span>
            {copied && <Check size={13} className="text-emerald-500" />}
          </button>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-describedby={showStrengthMeter ? `${id}-strength-info` : undefined}
          className={`block w-full rounded-xl bg-slate-50 dark:bg-[#09090b] py-2.5 pl-4 pr-11 text-slate-900 dark:text-[#fafafa] shadow-sm border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 dark:border-[#27272a] focus:border-blue-500 focus:ring-blue-500/20'
          } placeholder:text-slate-400 dark:placeholder:text-[#52525b] focus:outline-none focus:bg-white dark:focus:bg-[#09090b] focus:ring-2 sm:text-sm sm:leading-6 transition-all selection:bg-blue-500/30`}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#fafafa] transition-colors cursor-pointer"
          title={showPassword ? (isDe ? 'Passwort verbergen' : 'Hide password') : (isDe ? 'Passwort anzeigen' : 'Show password')}
          aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {copied && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-0.5">
          <CheckCircle2 size={13} />
          <span>{isDe ? 'Passwort wurde automatisch in die Zwischenablage kopiert!' : 'Password automatically copied to clipboard!'}</span>
        </div>
      )}

      {/* Visueller Stärke-Balken & Kriterien */}
      {showStrengthMeter && value.length > 0 && (
        <div id={`${id}-strength-info`} className="pt-1.5 space-y-2">
          {/* Balken */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                {isDe ? 'Passwortstärke:' : 'Password strength:'}
              </span>
              <span className={`font-semibold ${strength.colorClass}`}>
                {strength.label}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {[0, 1, 2, 3].map((step) => {
                const isActive = strength.score > step;
                return (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isActive ? strength.bgColorClass : 'bg-slate-200 dark:bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Kriterien Checkliste */}
          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80 text-[11px] space-y-1">
            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              {isDe ? 'Sicherheits-Kriterien:' : 'Security requirements:'}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div className={`flex items-center gap-1.5 ${strength.criteria.minLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-zinc-400'}`}>
                {strength.criteria.minLength ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 flex items-center justify-center text-[10px] text-slate-400">•</span>}
                <span>{isDe ? 'Mind. 8 Zeichen' : 'At least 8 chars'}</span>
              </div>

              <div className={`flex items-center gap-1.5 ${(strength.criteria.hasLower && strength.criteria.hasUpper) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-zinc-400'}`}>
                {(strength.criteria.hasLower && strength.criteria.hasUpper) ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 flex items-center justify-center text-[10px] text-slate-400">•</span>}
                <span>{isDe ? 'Groß- & Kleinbuchstaben' : 'Upper & lowercase'}</span>
              </div>

              <div className={`flex items-center gap-1.5 ${strength.criteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-zinc-400'}`}>
                {strength.criteria.hasNumber ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 flex items-center justify-center text-[10px] text-slate-400">•</span>}
                <span>{isDe ? 'Mindestens eine Zahl' : 'At least one number'}</span>
              </div>

              <div className={`flex items-center gap-1.5 ${strength.criteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-zinc-400'}`}>
                {strength.criteria.hasSpecial ? <Check size={12} className="shrink-0 text-emerald-500" /> : <span className="w-3 h-3 flex items-center justify-center text-[10px] text-slate-400">•</span>}
                <span>{isDe ? 'Sonderzeichen (!?#*@$)' : 'Special char (!?#*@$)'}</span>
              </div>
            </div>

            {!strength.criteria.notCommonOrName && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium pt-0.5">
                <X size={12} className="shrink-0 text-amber-500" />
                <span>{isDe ? 'Vermeide Namen oder bekannte einfache Passwörter' : 'Avoid names or common words'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
