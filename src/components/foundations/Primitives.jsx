import React, { forwardRef, useEffect, useId, useRef } from 'react';
import { Link } from '../../router';

const cx = (...parts) => parts.filter(Boolean).join(' ');

export const Button = forwardRef(function Button({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) {
  return <button ref={ref} type="button" className={cx('nq-button', `nq-button--${variant}`, `nq-button--${size}`, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="nq-button__spinner" aria-hidden="true" />}
    <span>{loading ? 'Working…' : children}</span>
  </button>;
});

export function ButtonLink({ to, variant = 'primary', size = 'md', className, children, ...props }) {
  return <Link to={to} className={cx('nq-button', 'nq-button-link', `nq-button--${variant}`, `nq-button--${size}`, className)} {...props}>{children}</Link>;
}

export const IconButton = forwardRef(function IconButton({ label, size = 'md', className, children, ...props }, ref) {
  return <button ref={ref} type="button" className={cx('nq-icon-button', `nq-icon-button--${size}`, className)} aria-label={label} title={label} {...props}>{children}</button>;
});

export function NavItem({ to, active = false, icon, children, className, ...props }) {
  return <Link to={to} className={cx('nq-nav-item', active && 'nq-nav-item--active', className)} aria-current={active ? 'page' : undefined} {...props}>
    {icon && <span className="nq-nav-item__icon" aria-hidden="true">{icon}</span>}<span>{children}</span>
  </Link>;
}

export function Surface({ as: Element = 'section', tone = 'default', padding = 'md', className, children, ...props }) {
  return <Element className={cx('nq-surface', `nq-surface--${tone}`, `nq-surface--padding-${padding}`, className)} {...props}>{children}</Element>;
}

export function Badge({ tone = 'neutral', children, className, ...props }) {
  return <span className={cx('nq-badge', `nq-badge--${tone}`, className)} {...props}>{children}</span>;
}

export const Field = forwardRef(function Field({ label, hint, error, id: suppliedId, className, ...inputProps }, ref) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const helpId = `${id}-help`;
  return <div className={cx('nq-field', className)}>
    <label className="nq-field__label" htmlFor={id}>{label}</label>
    <input ref={ref} id={id} className="nq-field__control" aria-invalid={Boolean(error)} aria-describedby={(hint || error) ? helpId : undefined} {...inputProps} />
    {(hint || error) && <span id={helpId} className={cx('nq-field__help', error && 'nq-field__help--error')}>{error || hint}</span>}
  </div>;
});

export const Select = forwardRef(function Select({ label, hint, error, id: suppliedId, children, className, ...props }, ref) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const helpId = `${id}-help`;
  return <div className={cx('nq-field', className)}>
    <label className="nq-field__label" htmlFor={id}>{label}</label>
    <select ref={ref} id={id} className="nq-field__control nq-field__select" aria-invalid={Boolean(error)} aria-describedby={(hint || error) ? helpId : undefined} {...props}>{children}</select>
    {(hint || error) && <span id={helpId} className={cx('nq-field__help', error && 'nq-field__help--error')}>{error || hint}</span>}
  </div>;
});

export function RadioCard({ label, description, meta, className, ...inputProps }) {
  return <label className={cx('nq-radio-card', className)}>
    <input className="nq-radio-card__input" type="radio" {...inputProps} />
    <span className="nq-radio-card__indicator" aria-hidden="true" />
    <span className="nq-radio-card__body"><span className="nq-radio-card__label">{label}</span>{description && <span className="nq-radio-card__description">{description}</span>}{meta && <span className="nq-radio-card__meta">{meta}</span>}</span>
  </label>;
}

export function Checkbox({ label, description, className, ...inputProps }) {
  return <label className={cx('nq-check', className)}><input type="checkbox" {...inputProps} /><span><strong>{label}</strong>{description && <small>{description}</small>}</span></label>;
}

export function Switch({ label, description, className, ...inputProps }) {
  return <label className={cx('nq-switch', className)}><input type="checkbox" role="switch" {...inputProps} /><span className="nq-switch__track" aria-hidden="true"><span /></span><span><strong>{label}</strong>{description && <small>{description}</small>}</span></label>;
}

export function ProgressBar({ value, max = 100, label, valueLabel, tone = 'progress', className }) {
  const bounded = Math.min(max, Math.max(0, value));
  const percent = max > 0 ? (bounded / max) * 100 : 0;
  return <div className={cx('nq-progress', `nq-progress--${tone}`, className)}>
    <div className="nq-progress__labels"><span>{label}</span><span data-technical>{valueLabel || `${Math.round(percent)}%`}</span></div>
    <div className="nq-progress__track" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax={max} aria-valuenow={bounded} aria-valuetext={valueLabel}><span style={{ width: `${percent}%` }} /></div>
  </div>;
}

export function StatTile({ label, value, detail, icon, tone = 'default', className }) {
  return <div className={cx('nq-stat', `nq-stat--${tone}`, className)}>{icon && <span className="nq-stat__icon" aria-hidden="true">{icon}</span>}<span className="nq-stat__label">{label}</span><strong className="nq-stat__value" data-technical>{value}</strong>{detail && <span className="nq-stat__detail">{detail}</span>}</div>;
}

export function Tooltip({ label, children }) {
  const id = useId();
  return <span className="nq-tooltip"><span className="nq-tooltip__trigger" tabIndex="0" aria-describedby={id}>{children}</span><span className="nq-tooltip__content" role="tooltip" id={id}>{label}</span></span>;
}

export function Dialog({ open, title, description, onClose, children, actions }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);
  return <dialog ref={ref} className="nq-dialog" onCancel={(event) => { event.preventDefault(); onClose?.(); }} onClose={onClose} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
    <div className="nq-dialog__header"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><IconButton label="Close dialog" size="sm" onClick={onClose}>×</IconButton></div>
    <div className="nq-dialog__body">{children}</div>{actions && <div className="nq-dialog__actions">{actions}</div>}
  </dialog>;
}

export function Notice({ tone = 'info', title, children, className }) {
  const urgent = tone === 'danger';
  return <div className={cx('nq-notice', `nq-notice--${tone}`, className)} role={urgent ? 'alert' : 'status'}><span className="nq-notice__mark" aria-hidden="true">{tone === 'success' ? '✓' : tone === 'danger' ? '!' : tone === 'warning' ? '!' : 'i'}</span><span><strong>{title}</strong>{children && <span>{children}</span>}</span></div>;
}

export function Tabs({ label, items, activeId, onChange, panelId, className }) {
  const onKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    onChange(items[nextIndex].id);
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  };
  return <div className={cx('nq-tabs', className)} role="tablist" aria-label={label}>{items.map((item, index) => <button key={item.id} id={panelId ? `${panelId}-${item.id}-tab` : undefined} type="button" role="tab" aria-controls={panelId} aria-selected={activeId === item.id} tabIndex={activeId === item.id ? 0 : -1} onClick={() => onChange(item.id)} onKeyDown={(event) => onKeyDown(event, index)}>{item.label}</button>)}</div>;
}

export function Skeleton({ width = '100%', height = '1rem', className }) {
  return <span className={cx('nq-skeleton', className)} style={{ width, height }} aria-hidden="true" />;
}

export function LoadingState({ label = 'Loading…' }) {
  return <div className="nq-state" role="status" aria-live="polite"><span className="nq-state__spinner" aria-hidden="true" /><strong>{label}</strong></div>;
}

export function EmptyState({ title, children, action }) {
  return <div className="nq-state"><span className="nq-state__symbol" aria-hidden="true">◇</span><strong>{title}</strong>{children && <p>{children}</p>}{action}</div>;
}

export function ErrorState({ title = 'Something went wrong', children, action }) {
  return <div className="nq-state nq-state--error" role="alert"><span className="nq-state__symbol" aria-hidden="true">!</span><strong>{title}</strong>{children && <p>{children}</p>}{action}</div>;
}

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return <header className={cx('nq-page-header', className)}><div>{eyebrow && <span className="nq-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="nq-page-header__actions">{actions}</div>}</header>;
}

export function SectionHeader({ title, description, action, headingId, className }) {
  return <div className={cx('nq-section-header', className)}><div><h2 id={headingId}>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function GameFrame({ children, className }) { return <section className={cx('nq-game-frame', className)}>{children}</section>; }

export function GameHUD({ stats }) {
  return <dl className="nq-game-hud">{stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd data-technical>{stat.value}</dd></div>)}</dl>;
}

export function AnswerOption({ selected, result, index, children, className, ...props }) {
  return <button type="button" className={cx('nq-answer', selected && 'nq-answer--selected', result && `nq-answer--${result}`, className)} aria-pressed={selected} {...props}><span>{children}</span>{index && <kbd>{index}</kbd>}</button>;
}

export function FeedbackNotice({ correct, title = correct ? 'Correct' : 'Not quite', children }) {
  return <Notice tone={correct ? 'success' : 'danger'} title={title}>{children}</Notice>;
}
