'use client'

const typeStyles = {
	case: {
		label: 'Кейс',
		icon: '💼',
	},
	practical: {
		label: 'Практика',
		icon: '⚡',
	},
	theory: {
		label: 'Теория',
		icon: '📚',
	},
	soft: {
		label: 'Soft Skills',
		icon: '🤝',
	},
}

export default function QuestionTypeBadge({ type }) {
	const style = typeStyles[type] || {
		label: type,
		icon: '❓',
	}
	return (
		<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/90">
			<span aria-hidden="true" className="text-sm">{style.icon}</span>
			{style.label}
		</span>
	)
}

