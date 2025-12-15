'use client'

const typeStyles = {
	case: {
		label: 'Кейс',
		icon: '💼',
		className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
	},
	practical: {
		label: 'Практика',
		icon: '⚡',
		className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
	},
	theory: {
		label: 'Теория',
		icon: '📚',
		className: 'bg-blue-50 text-blue-700 border-blue-200',
	},
	soft: {
		label: 'Soft Skills',
		icon: '🤝',
		className: 'bg-purple-50 text-purple-700 border-purple-200',
	},
}

export default function QuestionTypeBadge({ type }) {
	const style = typeStyles[type] || {
		label: type,
		icon: '❓',
		className: 'bg-slate-100 text-slate-700 border-slate-200',
	}
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.className}`}
		>
			<span aria-hidden="true">{style.icon}</span>
			{style.label}
		</span>
	)
}

