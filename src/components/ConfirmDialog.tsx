'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Submit',
  cancelText = 'Go Back',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title" id="confirm-title">{title}</h3>
        <p className="modal-body">{message}</p>
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? 'Submitting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
