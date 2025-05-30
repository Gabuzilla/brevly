import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const label = tv({
    base: 'block text-sm font-semibold mb-1 transition-colors duration-200',
    variants: {
        inputStatus: {
            normal: 'text-gray-700',
            error: 'text-red-600',
            active: 'text-blue-600',
        },
    },
    defaultVariants: {
        inputStatus: 'normal',
    },
});

interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof label> {
    inputId: string;
    children: React.ReactNode;
}

export const Label = ({ inputId, inputStatus, className, children, ...props }: LabelProps) => {
    return (
        <label
            htmlFor={inputId}
            className={label({ inputStatus, className })}
            {...props}
        >
            {children}
        </label>
    );
};