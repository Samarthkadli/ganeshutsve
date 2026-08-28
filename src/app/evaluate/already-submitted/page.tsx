import Link from 'next/link';

export default function AlreadySubmittedPage() {
  return (
    <div className="festive-bg">
      <div className="page-wrapper">
        <div className="page-content flex items-center justify-center" style={{ minHeight: '80vh' }}>
          <div className="container-narrow animate-slide-up">
            <div className="card card-elevated text-center" style={{ maxWidth: 480, margin: '0 auto', padding: '2.5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h2 style={{ marginBottom: '0.75rem' }}>Evaluation Already Submitted</h2>
              <p style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Your public evaluation has already been recorded. Thank you for participating.
              </p>
              <Link href="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
