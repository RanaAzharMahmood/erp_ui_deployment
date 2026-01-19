import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import type { Status } from '../../types/common.types';

interface StatusSelectorProps<T extends string = Status> {
  value: T;
  onChange: (status: T) => void;
  options?: T[];
}

/**
 * Reusable status selector component
 * Used across all add/edit pages for consistent status selection
 */
function StatusSelector<T extends string = Status>({
  value,
  onChange,
  options = ['Active', 'Prospect', 'Inactive'] as T[],
}: StatusSelectorProps<T>) {
  return (
    <FormControl component="fieldset">
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
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
}

export default StatusSelector;
