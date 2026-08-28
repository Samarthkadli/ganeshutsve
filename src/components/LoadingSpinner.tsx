export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="spinner-wrapper">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        {message && <p className="text-muted mt-md" style={{ fontSize: '0.9rem' }}>{message}</p>}
      </div>
    </div>
  );
}
