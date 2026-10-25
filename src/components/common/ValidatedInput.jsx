import { FiAlertCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ValidatedInput = ({
  label,
  fieldKey,
  value,
  onChange,
  placeholder,
  errors,
  warnings,
  normalRange,
  step = '0.1',
  required = false,
}) => {
  const hasError   = errors?.[fieldKey];
  const hasWarning = warnings?.[fieldKey] && !hasError;

  const borderColor = hasError
    ? 'rgba(255,77,109,0.5)'
    : hasWarning
    ? 'rgba(255,178,36,0.5)'
    : 'rgba(255,255,255,0.08)';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium"
          style={{ color: '#8b9ab5' }}>
          {label}
          {required && (
            <span style={{ color: '#ff4d6d' }}> *</span>
          )}
        </label>
        {normalRange && !hasError && !hasWarning && (
          <span className="text-xs" style={{ color: '#4e5e78' }}>
            Normal: {normalRange}
          </span>
        )}
      </div>

      <input
        type="number"
        step={step}
        value={value}
        onChange={e => onChange(fieldKey, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none
          transition-all duration-150"
        style={{
          background: '#111827',
          border: `1px solid ${borderColor}`,
          color: '#eef2ff',
        }}
        onFocus={e =>
          (e.target.style.borderColor = hasError
            ? 'rgba(255,77,109,0.7)'
            : hasWarning
            ? 'rgba(255,178,36,0.7)'
            : 'rgba(59,126,255,0.5)')}
        onBlur={e =>
          (e.target.style.borderColor = borderColor)}
      />

      {}
      {hasError && (
        <div className="flex items-center gap-1 mt-1">
          <FiAlertCircle size={11} style={{ color: '#ff4d6d' }} />
          <p className="text-xs" style={{ color: '#ff4d6d' }}>
            {errors[fieldKey]}
          </p>
        </div>
      )}

      {}
      {hasWarning && (
        <div className="flex items-center gap-1 mt-1">
          <FiAlertTriangle size={11} style={{ color: '#ffb224' }} />
          <p className="text-xs" style={{ color: '#ffb224' }}>
            {warnings[fieldKey]}
          </p>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;