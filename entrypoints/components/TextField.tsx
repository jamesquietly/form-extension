import { ChangeEventHandler } from 'react';

type TextFieldProps = {
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const TextField = ({ defaultValue, value, onChange }: TextFieldProps) => {
  return <input defaultValue={defaultValue} value={value} onChange={onChange} />;
};

export default TextField;
