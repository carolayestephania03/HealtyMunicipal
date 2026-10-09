
import React from 'react';

import {
  TextField,
  TextFieldProps,
} from '../ui/text-field';

type NumberFieldProps = Omit<
  TextFieldProps,
  'keyboardType'
> & {
  allowDecimal?: boolean;
  maxDecimals?: number;
};

export function NumberField({
  allowDecimal = true,
  maxDecimals = 2,
  onChangeText,
  ...props
}: NumberFieldProps) {
  const handleChange = (text: string) => {
    // Aceptar coma o punto como separador decimal.
    const normalized = text.replace(/,/g, '.');

    const cleaned = normalized.replace(
      allowDecimal ? /[^\d.]/g : /[^\d]/g,
      ''
    );

    if (!allowDecimal) {
      onChangeText?.(cleaned);
      return;
    }

    const parts = cleaned.split('.');
    const integer = parts[0];

    if (parts.length === 1) {
      onChangeText?.(integer);
      return;
    }

    const decimal = parts
      .slice(1)
      .join('')
      .slice(0, Math.max(0, maxDecimals));

    onChangeText?.(
      `${integer}.${decimal}`
    );
  };

  return (
    <TextField
      {...props}
      keyboardType={
        allowDecimal ? 'decimal-pad' : 'number-pad'
      }
      onChangeText={handleChange}
    />
  );
}
