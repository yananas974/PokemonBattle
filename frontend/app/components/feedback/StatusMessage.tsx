type StatusType = 'error' | 'success' | 'info' | 'warning';

interface StatusMessageProps {
  type: StatusType;
  title?: string;
  message: string;
}

const statusStyles = {
  error: {
    bg: 'bg-red-900 bg-opacity-50',
    border: 'border-red-500',
    text: 'text-red-200',
    icon: '❌',
    title: 'Erreur',
  },
  success: {
    bg: 'bg-green-900 bg-opacity-50',
    border: 'border-green-500',
    text: 'text-green-300',
    icon: '✅',
    title: 'Succès',
  },
  info: {
    bg: 'bg-blue-900 bg-opacity-50',
    border: 'border-blue-500',
    text: 'text-blue-200',
    icon: 'ℹ️',
    title: 'Information',
  },
  warning: {
    bg: 'bg-yellow-900 bg-opacity-50',
    border: 'border-yellow-500',
    text: 'text-yellow-200',
    icon: '⚠️',
    title: 'Attention',
  },
};

export default function StatusMessage({ type, title, message }: StatusMessageProps) {
  const style = statusStyles[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-2xl p-6 mb-8 text-center`}>
      <div className="text-6xl mb-4">{style.icon}</div>
      {title && <h2 className="text-2xl font-bold text-white mb-2">{title || style.title}</h2>}
      <p className={`${style.text}`}>{message}</p>
    </div>
  );
}

