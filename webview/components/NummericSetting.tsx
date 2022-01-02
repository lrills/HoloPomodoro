import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Input from '@mui/material/Input';

type NummericSettingProps = {
  fieldName: string;
  fieldId: string;
  onChange: (val: number) => void;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  disabled: boolean;
};

const NummericSetting = ({
  onChange,
  fieldName,
  fieldId,
  value,
  min,
  max,
  step,
  unit,
  disabled,
}: NummericSettingProps) => {
  const [inputValue, setInputValue] = React.useState<
    string | number | undefined
  >();

  const handleChangeCompleted = () => {
    if (
      typeof inputValue === 'number' &&
      inputValue >= min &&
      inputValue <= max
    ) {
      onChange(inputValue);
    }
    setInputValue(undefined);
  };

  return (
    <Box>
      <Typography id={fieldId} gutterBottom>
        {fieldName}
      </Typography>
      <Stack spacing={2} direction="row">
        <Slider
          value={typeof inputValue === 'number' ? inputValue : value}
          onChange={(_, value) => {
            setInputValue(value as number);
          }}
          onChangeCommitted={handleChangeCompleted}
          min={min}
          max={max}
          step={step}
          marks={!!step}
          valueLabelDisplay="auto"
          disabled={disabled}
        />
        <Input
          value={typeof inputValue === 'undefined' ? value : inputValue}
          onChange={({ target }) => {
            const editingValue = Number(target.value);
            if (target.value === '' || editingValue === NaN) {
              setInputValue(target.value);
            } else {
              setInputValue(editingValue);
            }
          }}
          onBlur={handleChangeCompleted}
          size="small"
          style={{ width: '65px' }}
          disabled={disabled}
          inputProps={{
            min: min,
            max: max,
            type: 'number',
            'aria-labelledby': fieldId,
          }}
        />
        <Typography component="span">{unit}</Typography>
      </Stack>
    </Box>
  );
};

export default NummericSetting;
