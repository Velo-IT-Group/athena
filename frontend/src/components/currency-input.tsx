'use client';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import ReactCurrencyInput, { CurrencyInputProps, CurrencyInputOnChangeValues } from 'react-currency-input-field';
import { toast } from 'sonner';

interface Props extends CurrencyInputProps {
	handleBlurChange?: (amount?: number | null | undefined) => void;
	className?: string;
}

const CurrencyInput = ({ className, defaultValue, handleBlurChange, ...props }: Props) => {
	const [value, setValue] = useState<string | number | undefined>(defaultValue);
	const [values, setValues] = useState<CurrencyInputOnChangeValues>();

	/**
	 * Handle validation
	 */
	const handleOnValueChange: CurrencyInputProps['onValueChange'] = (_value, name, _values) => {
		// _values is only for demo purposes in this example
		setValues(_values);

		if (!_value) {
			setValue('');
			return;
		}

		setValue(_value);
	};

	return (
		<ReactCurrencyInput
			placeholder='$0.00'
			decimalsLimit={2}
			decimalScale={2}
			intlConfig={{ locale: 'en-US', currency: 'USD' }}
			value={value}
			onValueChange={handleOnValueChange}
			onBlur={(e) => {
				try {
					handleBlurChange && handleBlurChange(values?.float);
				} catch (error) {
					toast('Error updating ');
				}
			}}
			className={cn(
				'flex h-9 w-full bg-transparent rounded-md border border-input hover:bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			{...props}
		/>
	);
};

export default CurrencyInput;
