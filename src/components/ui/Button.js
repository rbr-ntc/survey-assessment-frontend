import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import React from 'react'

const Button = React.forwardRef(
	(
		{
			className,
			variant = 'default',
			size = 'default',
			asChild = false,
			...props
		},
		ref
	) => {
		// Simple variant mapping since we don't have full class-variance-authority setup here yet
		const variants = {
			default:
				'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 border-transparent',
			outline:
				'border border-white/20 bg-transparent hover:bg-white/10 text-white',
			ghost: 'hover:bg-white/10 text-white',
			link: 'text-indigo-300 underline-offset-4 hover:underline',
			glass:
				'bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md shadow-sm',
		}

		const sizes = {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 rounded-md px-3',
			lg: 'h-11 rounded-md px-8',
			icon: 'h-10 w-10',
		}

		const Comp = asChild ? Slot : 'button'

		return (
			<Comp
				className={cn(
					'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
					variants[variant],
					sizes[size],
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'

export { Button }
