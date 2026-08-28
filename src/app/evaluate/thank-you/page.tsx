import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="festive-bg">
      <div className="page-wrapper">
        <div className="page-content flex items-center justify-center" style={{ minHeight: '80vh' }}>
          <div className="thank-you-container animate-slide-up">
            <div className="thank-you-icon">✅</div>
            <h1 className="thank-you-title">Thank You!</h1>
            <p className="thank-you-message" style={{ marginBottom: '1rem' }}>
              Your evaluation has been successfully recorded.
            </p>
            <p className="thank-you-message">
              Thank you for participating in Koppal Ganapathi Utsava 2026.
            </p>
            <div className="mt-xl">
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
