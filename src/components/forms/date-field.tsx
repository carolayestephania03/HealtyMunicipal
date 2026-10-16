
import React from 'react';

import {
  TextField,
  TextFieldProps,
} from '../ui/text-field';

type DateFieldProps = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'keyboardType' | 'maxLength'
> & {
  value: string;
  onChangeText: (value: string) => void;
};

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function DateField({
  value,
  onChangeText,
  helperText,
  error,
  placeholder = 'AAAA-MM-DD',
  ...props
}: DateFieldProps) {
  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);

    let formatted = digits.slice(0, 4);

    if (digits.length > 4) {
      formatted += '-' + digits.slice(4, 6);
    }

    if (digits.length > 6) {
      formatted += '-' + digits.slice(6, 8);
    }

    onChangeText(formatted);
  };

  const invalidDate =
    value.length === 10 && !isValidISODate(value);

  const displayError =
    error ??
    (invalidDate
      ? 'Ingrese una fecha válida.'
      : undefined);

  return (
    <TextField
      {...props}
      value={value}
      onChangeText={handleChange}
      keyboardType="number-pad"
      maxLength={10}
      placeholder={placeholder}
      helperText={helperText ?? 'Formato: AAAA-MM-DD'}
      error={displayError}
    />
  );
}
