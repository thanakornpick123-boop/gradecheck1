import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Info,
  Loader2,
  X,
} from 'lucide-react'
import { useApp } from '../store/AppStore'

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const BUTTON_BASE =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const BUTTON_VARIANTS = {
  primary:
    'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700 active:scale-[.985] focus-visible:ring-indigo-500',
  secondary:
    'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 active:scale-[.985] focus-visible:ring-indigo-500',
  soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-500',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 active:scale-[.985] focus-visible:ring-rose-500',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500',
}

const BUTTON_SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
  icon: 'h-9 w-9',
}

export function buttonStyles({ variant = 'primary', size = 'md', className = '' } = {}) {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', loading, children, ...props }) {
  return (
    <button type={type} className={buttonStyles({ variant, size, className })} {...props}>
      {loading ? <Loader2 size={17} className="animate-spin" /> : null}
      {children}
    </button>
  )
}

export function Logo({ dark = false, compact = false, className = '' }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
        <GraduationCap size={21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={cn('block text-[17px] font-semibold tracking-tight', dark ? 'text-white' : 'text-slate-900')}>
            GradeCheck
          </span>
          <span className={cn('block text-[11px] font-light', dark ? 'text-slate-400' : 'text-slate-500')}>
            ระบบตรวจคะแนนออนไลน์
          </span>
        </span>
      )}
    </div>
  )
}

export function Input({ label, hint, error, icon: Icon, rightElement, className, id, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <label htmlFor={inputId} className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <span className="relative block">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-slate-900 shadow-xs transition placeholder:text-slate-400',
            'focus:outline-none focus:ring-4',
            Icon && 'pl-10',
            rightElement && 'pr-11',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100',
            className,
          )}
          {...props}
        />
        {rightElement && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightElement}</span>}
      </span>
      {error ? (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle size={13} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

export function Select({ label, hint, error, className, id, children, ...props }) {
  const autoId = useId()
  const selectId = id || autoId
  return (
    <label htmlFor={selectId} className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <span className="relative block">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-[15px] text-slate-900 shadow-xs transition hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100',
            error && 'border-rose-300',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

const BADGE_TONES = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  glass: 'bg-white/10 text-white ring-white/15',
}

export function Badge({ tone = 'slate', className = '', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        BADGE_TONES[tone] || BADGE_TONES.slate,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        checked ? 'bg-indigo-600' : 'bg-slate-300',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

const MODAL_SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

export function Modal({ open, onClose, title, subtitle, icon, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm animate-fade-in" />
      <div
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-950/20 animate-sheet-up sm:rounded-3xl',
          MODAL_SIZES[size],
        )}
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          {icon && (
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'ยืนยัน',
  confirmVariant = 'danger',
  icon,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      size="sm"
      icon={icon || <AlertCircle size={20} />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600">
        การดำเนินการนี้จะถูกบันทึกไว้ในประวัติการแก้ไข และไม่สามารถย้อนกลับได้อัตโนมัติ
      </p>
    </Modal>
  )
}

export function Dropdown({ button, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((value) => !value)}>{button}</div>
      {open && (
        <div
          className={cn(
            'absolute z-30 mt-2 min-w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ icon: Icon, children, onClick, tone = 'default', disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition disabled:opacity-40',
        tone === 'danger'
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
      )}
    >
      {Icon && <Icon size={16} className={tone === 'danger' ? 'text-rose-500' : 'text-slate-400'} />}
      {children}
    </button>
  )
}

export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Avatar({ name, className = '' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-medium text-white',
        className,
      )}
    >
      {name || '?'}
    </span>
  )
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-600">{eyebrow}</p>}
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

const TOAST_STYLES = {
  success: { icon: CheckCircle2, classes: 'text-emerald-600 bg-emerald-50' },
  error: { icon: AlertCircle, classes: 'text-rose-600 bg-rose-50' },
  info: { icon: Info, classes: 'text-indigo-600 bg-indigo-50' },
}

export function ToastHost() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null
  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info
        const Icon = style.icon
        return (
          <button
            type="button"
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 text-left shadow-xl shadow-slate-900/10 backdrop-blur animate-toast-in"
          >
            <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', style.classes)}>
              <Icon size={17} />
            </span>
            <span className="flex-1 text-sm leading-snug text-slate-700">{toast.message}</span>
            <X size={15} className="mt-1 shrink-0 text-slate-300" />
          </button>
        )
      })}
    </div>,
    document.body,
  )
}
