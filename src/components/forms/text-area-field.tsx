
import React from 'react';

import {
  StyleSheet,
} from 'react-native';

import {
  TextField,
  TextFieldProps,
} from '../ui/text-field';

type TextAreaFieldProps = TextFieldProps & {
  rows?: number;
};

export function TextAreaField({
  rows = 4,
  style,
  ...props
}: TextAreaFieldProps) {
  return (
    <TextField
      {...props}
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      style={[
        styles.textArea,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 95,
    paddingTop: 12,
  },
});
