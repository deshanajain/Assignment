interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    error: '❌',
    success: '✅',
    info: 'ℹ️'
  };

  return (
    <div className={`p-4 border rounded-lg ${colors[type]} flex justify-between items-center`}>
      <div className="flex items-center space-x-2">
        <span>{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg cursor-pointer">×</button>
      )}
    </div>
  );
}
