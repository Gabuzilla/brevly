import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const input = tv({
    base: 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors duration-200 text-black',
    variants: {
        inputStatus: {
            normal: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
            active: 'border-blue-500 ring-blue-500',
        },
    },
    defaultVariants: {
        inputStatus: 'normal',
    },
});

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof input> {
    inputId: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ inputId, inputStatus, className, ...props }, ref) => {
        return (
            <input
                id={inputId}
                ref={ref}
                className={input({ inputStatus, className })}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';