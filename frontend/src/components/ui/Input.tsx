import React from 'react';
import { theme } from '../../styles/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string | number; label: string }>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  };

  const inputWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    paddingLeft: leftIcon ? theme.spacing.xl : theme.spacing.md,
    paddingRight: rightIcon ? theme.spacing.xl : theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${error ? theme.colors.danger : isFocused ? theme.colors.primary.DEFAULT : theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: `all ${theme.transitions.base}`,
    boxShadow: isFocused && !error ? `0 0 0 3px ${theme.colors.primary.DEFAULT}20` : 'none',
    ...style,
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.text.secondary,
    pointerEvents: 'none',
  };

  const helperStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: error ? theme.colors.danger : theme.colors.text.secondary,
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={inputWrapperStyles}>
        {leftIcon && <div style={{ ...iconStyles, left: theme.spacing.md }}>{leftIcon}</div>}
        <input
          {...props}
          style={inputStyles}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightIcon && <div style={{ ...iconStyles, right: theme.spacing.md }}>{rightIcon}</div>}
      </div>
      {(error || helperText) && <span style={helperStyles}>{error || helperText}</span>}
    </div>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  };

  const textareaStyles: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${error ? theme.colors.danger : isFocused ? theme.colors.primary.DEFAULT : theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: `all ${theme.transitions.base}`,
    boxShadow: isFocused && !error ? `0 0 0 3px ${theme.colors.primary.DEFAULT}20` : 'none',
    resize: 'vertical',
    minHeight: '100px',
    ...style,
  };

  const helperStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: error ? theme.colors.danger : theme.colors.text.secondary,
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <textarea
        {...props}
        style={textareaStyles}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />
      {(error || helperText) && <span style={helperStyles}>{error || helperText}</span>}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  };

  const selectStyles: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${error ? theme.colors.danger : isFocused ? theme.colors.primary.DEFAULT : theme.colors.border.light}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: `all ${theme.transitions.base}`,
    boxShadow: isFocused && !error ? `0 0 0 3px ${theme.colors.primary.DEFAULT}20` : 'none',
    cursor: 'pointer',
    ...style,
  };

  const helperStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: error ? theme.colors.danger : theme.colors.text.secondary,
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <select
        {...props}
        style={selectStyles}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && <span style={helperStyles}>{error || helperText}</span>}
    </div>
  );
};
