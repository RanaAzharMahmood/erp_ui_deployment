import React from 'react';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import type { Status } from '../../types/common.types';

interface StatusSelectorProps {
  value: Status | string;
  onChange: (status: Status) => void;
  options?: Status[];
}

/**
 * Reusable status selector component
 * Used across all add/edit pages for consistent status selection
 */
const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onChange,
  options = ['Active', 'Prospect', 'Inactive'],
}) => {
  return (
    <FormControl component="fieldset">
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value as Status)}
      >
        {options.map((status) => (
          <FormControlLabel
            key={status}
            value={status}
            control={
              <Radio
                sx={{
                  color: '#FF6B35',
                  '&.Mui-checked': {
                    color: '#FF6B35',
                  },
                }}
              />
            }
            label={status}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default StatusSelector;
