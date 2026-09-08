'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import StarRating from '@/components/StarRating';
import ConfirmDialog from '@/components/ConfirmDialog';
import { EVALUATION_QUESTIONS, APP_CONFIG } from '@/lib/config';
import { submitReview, fetchExistingReviewByEmail } from '@/app/actions/reviews';
import { searchExistingMandals } from '@/app/actions/mandals';
import { sendOtpToEmail, verifyOtpCode } from '@/app/actions/email-otp';
import type { ReviewFormData } from '@/types/database';
import { isValidEmailFormat, getSuggestedEmail } from '@/lib/email-validator';

type RatingKey = typeof EVALUATION_QUESTIONS[number]['id'];

interface MandalSuggestion {
  id: string;
  name: string;
  name_en?: string;
  area: string;
}

export default function HomeEvaluationPage() {
  const [mandalName, setMandalName] = useState('');
  const [area, setArea] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [selectedMandalId, setSelectedMandalId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MandalSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isExistingLoaded, setIsExistingLoaded] = useState(false);
  const [isFetchingReview, setIsFetchingReview] = useState(false);
  const [isNewReviewNotice, setIsNewReviewNotice] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

  // OTP Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({} as Record<RatingKey, number>);
  const [feedback, setFeedback] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedMandal, setSubmittedMandal] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Live search debounce when mandalName changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = mandalName.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchExistingMandals(trimmed);
        if (result.mandals && result.mandals.length > 0) {
          setSuggestions(result.mandals);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [mandalName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-fetch existing review when Mandal Name + Email are entered
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    const trimmedEmail = reviewerEmail.trim();
    const trimmedMandal = mandalName.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || !trimmedMandal) {
      setRatings({} as Record<RatingKey, number>);
      setFeedback('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsExistingLoaded(false);
      setIsNewReviewNotice(false);
      return;
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      setIsFetchingReview(true);
      try {
        const result = await fetchExistingReviewByEmail(trimmedMandal, selectedMandalId || undefined, trimmedEmail);
        if (result.review) {
          const r = result.review;
          setRatings({
            idol_rating: r.idol_rating,
            decoration_rating: r.decoration_rating,
            lighting_rating: r.lighting_rating,
            creativity_rating: r.creativity_rating,
            cleanliness_rating: r.cleanliness_rating,
            eco_friendly_rating: r.eco_friendly_rating,
            cultural_rating: r.cultural_rating,
            discipline_rating: r.discipline_rating,
            facilities_rating: r.facilities_rating,
            overall_rating: r.overall_rating,
          });
          setFeedback(r.feedback || '');
          setPhotoPreview(r.photo_url || null);
          setIsExistingLoaded(true);
          setIsNewReviewNotice(false);
        } else {
          setRatings({} as Record<RatingKey, number>);
          setFeedback('');
          setPhotoFile(null);
          setPhotoPreview(null);
          setIsExistingLoaded(false);
          setIsNewReviewNotice(true);
        }
      } catch (err) {
        console.error('Fetch existing review error:', err);
      } finally {
        setIsFetchingReview(false);
      }
    }, 400);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [mandalName, selectedMandalId, reviewerEmail]);

  const handleSelectSuggestion = (item: MandalSuggestion) => {
    setMandalName(item.name);
    setArea(item.area || '');
    setSelectedMandalId(item.id);
    setShowSuggestions(false);
    if (errors.mandal_name) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mandal_name;
        return next;
      });
    }
  };

  const handleRatingChange = useCallback((id: RatingKey, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleSendOtp = async () => {
    const cleanEmail = reviewerEmail.trim();
    if (!cleanEmail) {
      setOtpError('ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ / Please enter your email address.');
      return;
    }
    if (!isValidEmailFormat(cleanEmail)) {
      setOtpError('ಸಿಂಧುತ್ವ ಹೊಂದಿರುವ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ / Please enter a valid email address.');
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');
    setOtpMessage('');

    const res = await sendOtpToEmail(cleanEmail);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setOtpMessage(res.message || 'OTP sent successfully!');
      if (res.demoCode) {
        setDemoOtpCode(res.demoCode);
      } else {
        setDemoOtpCode(null);
      }
      setResendCooldown(60);
    } else {
      setOtpError(res.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    const res = await verifyOtpCode(reviewerEmail, otpCode);
    setIsVerifyingOtp(false);

    if (res.success) {
      setIsEmailVerified(true);
      setOtpMessage('✅ Email successfully verified!');
      setOtpError('');
      if (errors.reviewer_email) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.reviewer_email;
          return next;
        });
      }
    } else {
      setOtpError(res.error || 'Invalid OTP code.');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!mandalName.trim()) {
      newErrors.mandal_name = 'Please enter the Ganesh Mandal name.';
    }

    const trimmedEmail = reviewerEmail.trim();
    if (!trimmedEmail) {
      newErrors.reviewer_email = 'ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ / Please enter your email address.';
    } else if (!isValidEmailFormat(trimmedEmail)) {
      newErrors.reviewer_email = 'ಸಿಂಧುತ್ವ ಹೊಂದಿರುವ ಸರಿಯಾದ ಇಮೇಲ್ ನಮೂದಿಸಿ (ಉದಾ: user@gmail.com) / Please enter a valid email address (e.g. user@gmail.com).';
    } else if (!isEmailVerified) {
      newErrors.reviewer_email = 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ OTP ಪರಿಶೀಲಿಸಿ / Please verify your email with OTP before submitting.';
    }

    for (const q of EVALUATION_QUESTIONS) {
      if (!ratings[q.id] || ratings[q.id] < 1 || ratings[q.id] > 10) {
        newErrors[q.id] = `Please rate ${q.label}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (!validate()) {
      if (!mandalName.trim()) {
        document.getElementById('mandal-name-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('mandal-name-input')?.focus();
      } else if (errors.reviewer_email || !reviewerEmail.trim()) {
        document.getElementById('reviewer-email-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('reviewer-email-input')?.focus();
      } else {
        const firstErrorKey = EVALUATION_QUESTIONS.find((q) => !ratings[q.id])?.id;
        if (firstErrorKey) {
          document.getElementById(`question-${firstErrorKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const data: ReviewFormData = {
        mandal_name: mandalName.trim(),
        mandal_id: selectedMandalId || undefined,
        area: area.trim() || undefined,
        reviewer_email: reviewerEmail.trim().toLowerCase(),
        idol_rating: ratings.idol_rating,
        decoration_rating: ratings.decoration_rating,
        lighting_rating: ratings.lighting_rating,
        creativity_rating: ratings.creativity_rating,
        cleanliness_rating: ratings.cleanliness_rating,
        eco_friendly_rating: ratings.eco_friendly_rating,
        cultural_rating: ratings.cultural_rating,
        discipline_rating: ratings.discipline_rating,
        facilities_rating: ratings.facilities_rating,
        overall_rating: ratings.overall_rating,
        feedback: feedback.trim() || undefined,
        photo: photoPreview || undefined,
      };

      const result = await submitReview(data);

      if (result.error) {
        setSubmitError(result.error);
        setShowConfirm(false);
      } else {
        setSubmittedMandal(mandalName.trim());
        setShowConfirm(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setMandalName('');
    setArea('');
    setReviewerEmail('');
    setSelectedMandalId(null);
    setRatings({} as Record<RatingKey, number>);
    setFeedback('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setSubmitError('');
    setSubmittedMandal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Success State
  if (submittedMandal) {
    return (
      <div className="festive-bg">
        <div className="page-wrapper">
          <div className="page-content flex items-center justify-center" style={{ minHeight: '80vh' }}>
            <div className="thank-you-container animate-slide-up" style={{ maxWidth: 540, textAlign: 'center' }}>
              <div className="thank-you-icon" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🙏</div>
              <h1 className="thank-you-title" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                Thank You!
              </h1>
              <p className="thank-you-message" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Your review for <strong>{submittedMandal}</strong> has been successfully recorded.
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>
                Thank you for contributing to Koppal Ganapathi Utsava 2026.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleReset}
                  id="evaluate-another-btn"
                >
                  ✨ Review Another Mandal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="festive-bg">
      <div className="page-wrapper">
        <div className="page-content">
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="animate-slide-up">
              {/* Header */}
              <div className="page-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  minHeight: '190px',
                }}>
                  {/* Left Aligned: Lokmanya Tilak Portrait */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(229, 193, 88, 0.2) 0%, rgba(232, 117, 26, 0.1) 55%, transparent 75%)',
                        filter: 'blur(16px)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                      }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/tilak.png"
                        alt="Lokmanya Tilak"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: '50%',
                          position: 'relative',
                          zIndex: 1,
                          filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.65))',
                        }}
                      />
                    </div>
                  </div>

                  {/* Center: Lord Ganesha Emblem */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '220px',
                      height: '220px',
                      background: 'radial-gradient(circle, rgba(229, 193, 88, 0.22) 0%, rgba(232, 117, 26, 0.12) 55%, transparent 75%)',
                      filter: 'blur(20px)',
                      pointerEvents: 'none',
                      borderRadius: '50%',
                    }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/ganesha.png"
                      alt="Lord Ganesha"
                      style={{
                        width: '170px',
                        height: 'auto',
                        maxHeight: '190px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                        position: 'relative',
                        zIndex: 1,
                        filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.65))',
                      }}
                    />
                  </div>

                  {/* Right Aligned: Swamiji Portrait */}
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(229, 193, 88, 0.2) 0%, rgba(232, 117, 26, 0.1) 55%, transparent 75%)',
                        filter: 'blur(16px)',
                        pointerEvents: 'none',
                        borderRadius: '50%',
                      }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/swamiji.png"
                        alt="Sri Swamiji"
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: '50%',
                          position: 'relative',
                          zIndex: 1,
                          filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.65))',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-gold-light)',
                  letterSpacing: '0.15em',
                  marginBottom: '0.6rem',
                  opacity: 0.9
                }}>
                  🙏 ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ 🙏
                </div>
                <h1 className="text-gold-gradient" style={{
                  fontSize: 'clamp(1rem, 3.4vw, 1.65rem)',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                  marginBottom: '0.35rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {APP_CONFIG.appName}
                </h1>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-gold-light)', marginBottom: '0.2rem' }}>
                  {APP_CONFIG.appNameEnglish}
                </p>
                <p style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>
                  {APP_CONFIG.organizer}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem', marginBottom: '0.6rem' }}>
                  {APP_CONFIG.organizerEnglish}
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '5px 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-border-strong)',
                  color: 'var(--color-gold-light)',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  marginBottom: '0.5rem',
                }}>
                  {APP_CONFIG.subtitle}
                </div>
              </div>

              {submitError && (
                <div className="alert alert-error mb-lg">{submitError}</div>
              )}

              {/* Mandal Input Card with Live Suggestions */}
              <div
                ref={searchContainerRef}
                className={`eval-question ${errors.mandal_name ? 'has-error' : ''}`}
                style={{
                  position: 'relative',
                  marginBottom: '1.75rem',
                }}
              >
                <div className="eval-question-number" style={{ color: 'var(--color-gold-light)' }}>
                  ಹಂತ 1 • ಮಂಡಳಿ ಮಾಹಿತಿ / Step 1 • Mandal Information
                </div>
                <label
                  htmlFor="mandal-name-input"
                  className="eval-question-label"
                  style={{ display: 'block', marginBottom: '2px' }}
                >
                  ಗಣೇಶ ಮಂಡಳಿ ಹೆಸರು <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  Name of the Ganesh Mandal <span style={{ color: 'var(--color-error)' }}>*</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="mandal-name-input"
                    className="form-input"
                    placeholder="Type mandal name (e.g. Sri Siddhivinayak Ganesh Mandal)"
                    value={mandalName}
                    onChange={(e) => {
                      setMandalName(e.target.value);
                      setSelectedMandalId(null);
                      if (errors.mandal_name) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.mandal_name;
                          return next;
                        });
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    disabled={submitting}
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      padding: '0.85rem 1rem',
                      borderColor: errors.mandal_name ? 'var(--color-error)' : undefined,
                    }}
                    autoFocus
                    autoComplete="off"
                  />

                  {isSearching && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      🔍 Searching...
                    </span>
                  )}

                  {/* Autocomplete Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(20, 10, 15, 0.96)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 50,
                        maxHeight: '260px',
                        overflowY: 'auto',
                      }}
                    >
                      <div
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--color-gold-light)',
                          background: 'rgba(229, 193, 88, 0.15)',
                          borderBottom: '1px solid var(--color-border)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        ⚡ Matching Existing Mandals (Click to Select)
                      </div>
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSuggestion(item)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--color-border-light)',
                            transition: 'background 150ms ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(229, 193, 88, 0.18)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                              🏛️ {item.name}
                            </div>
                            {item.name_en && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--color-gold-light)', fontStyle: 'italic', marginTop: '1px' }}>
                                🔤 {item.name_en}
                              </div>
                            )}
                            {item.area && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                📍 {item.area}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: 'rgba(46, 204, 113, 0.15)',
                              color: 'var(--color-success)',
                              border: '1px solid rgba(46, 204, 113, 0.3)',
                              fontWeight: 600,
                            }}
                          >
                            Existing
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.mandal_name && (
                  <p className="form-error mt-sm">{errors.mandal_name}</p>
                )}

                {/* Reviewer Email Field (Required for 1 review per email rule) */}
                <div style={{ marginTop: '1.25rem' }}>
                  <label
                    htmlFor="reviewer-email-input"
                    className="eval-question-label"
                    style={{ display: 'block', marginBottom: '2px', fontSize: '0.95rem' }}
                  >
                    ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ / Your Email Address <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                    Used to ensure 1 review per Mandal per email address <span style={{ color: 'var(--color-error)' }}>*</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                    <input
                      type="email"
                      id="reviewer-email-input"
                      className="form-input"
                      placeholder="e.g. reviewer@gmail.com"
                      value={reviewerEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReviewerEmail(val);
                        setIsEmailVerified(false);
                        setOtpSent(false);
                        const suggestion = getSuggestedEmail(val);
                        setEmailSuggestion(suggestion);
                        if (errors.reviewer_email) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.reviewer_email;
                            return next;
                          });
                        }
                      }}
                      disabled={submitting || isEmailVerified}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: '0.95rem',
                        borderColor: isEmailVerified
                          ? 'var(--color-success)'
                          : errors.reviewer_email
                          ? 'var(--color-error)'
                          : emailSuggestion
                          ? '#f39c12'
                          : undefined,
                        background: isEmailVerified ? 'rgba(46, 204, 113, 0.08)' : undefined,
                      }}
                      autoComplete="email"
                    />

                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!reviewerEmail.trim()) {
                            setOtpError('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ಮೊದಲು ನಮೂದಿಸಿ / Please enter your email address first.');
                            document.getElementById('reviewer-email-input')?.focus();
                            return;
                          }
                          handleSendOtp();
                        }}
                        disabled={isSendingOtp || resendCooldown > 0}
                        className="btn-otp"
                        style={{
                          background: resendCooldown > 0
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #e5c158 50%, #d97706 100%)',
                          color: resendCooldown > 0 ? '#94a3b8' : '#000000',
                          border: resendCooldown > 0 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #f59e0b',
                          boxShadow: resendCooldown > 0 ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.35)',
                          cursor: resendCooldown > 0 || isSendingOtp ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSendingOtp ? (
                          '⏳ Sending...'
                        ) : resendCooldown > 0 ? (
                          `⏳ (${resendCooldown}s)`
                        ) : otpSent ? (
                          '🔄 Resend'
                        ) : (
                          '📩 Send OTP'
                        )}
                      </button>
                    )}
                  </div>

                  {isEmailVerified && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '6px 12px',
                        background: 'rgba(46, 204, 113, 0.15)',
                        border: '1px solid rgba(46, 204, 113, 0.4)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-success)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ✅ ಇಮೇಲ್ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! / Email Verified!
                    </div>
                  )}

                  {emailSuggestion && !isEmailVerified && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '10px 14px',
                        background: 'rgba(243, 156, 18, 0.15)',
                        border: '1px solid rgba(243, 156, 18, 0.4)',
                        borderRadius: 'var(--radius-md)',
                        color: '#f39c12',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div>
                        💡 <strong>ನೀವು ಇಮೇಲ್ ತಪ್ಪು ಬರೆದಿದ್ದೀರಾ? / Did you mean:</strong>{' '}
                        <span style={{ textDecoration: 'underline', fontWeight: 700 }}>{emailSuggestion}</span>?
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewerEmail(emailSuggestion);
                          setEmailSuggestion(null);
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.reviewer_email;
                            return next;
                          });
                        }}
                        style={{
                          padding: '4px 12px',
                          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Fix Email / ಸರಿಪಡಿಸಿ
                      </button>
                    </div>
                  )}

                  {/* OTP Code Entry Section */}
                  {otpSent && !isEmailVerified && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '16px 18px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '2px solid #f59e0b',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.25)',
                      }}
                    >
                      <label
                        htmlFor="otp-code-input"
                        style={{
                          display: 'block',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#f59e0b',
                          marginBottom: '6px',
                        }}
                      >
                        📩 6-ಅಂಕಿಯ OTP ಕೋಡ್ ನಮೂದಿಸಿ / Enter 6-digit Verification OTP
                      </label>

                      {demoOtpCode ? (
                        <div
                          style={{
                            marginTop: '0.4rem',
                            marginBottom: '0.9rem',
                            padding: '12px 16px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                          }}
                        >
                          🔑 <strong>ನಿಮ್ಮ OTP ಕೋಡ್ / Your Verification Code:</strong>{' '}
                          <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.2em', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.2)', padding: '3px 10px', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                            {demoOtpCode}
                          </span>
                          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px' }}>
                            (Copy/enter this 6-digit code below to complete verification)
                          </div>
                        </div>
                      ) : otpMessage ? (
                        <div style={{ fontSize: '0.88rem', color: '#f59e0b', fontWeight: 600, marginBottom: '10px', wordBreak: 'break-word' }}>
                          {otpMessage}
                        </div>
                      ) : null}

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <input
                          type="text"
                          id="otp-code-input"
                          className="form-input"
                          placeholder="123456"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: '1.2rem',
                            letterSpacing: '0.25em',
                            textAlign: 'center',
                            fontWeight: 800,
                            borderColor: '#f59e0b',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: '#ffffff',
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || otpCode.length !== 6}
                          className="btn-otp"
                          style={{
                            background: otpCode.length === 6
                              ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                              : 'rgba(255, 255, 255, 0.15)',
                            color: otpCode.length === 6 ? '#ffffff' : '#94a3b8',
                            border: otpCode.length === 6 ? '1px solid #2ecc71' : '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: otpCode.length === 6 ? 'pointer' : 'not-allowed',
                            boxShadow: otpCode.length === 6 ? '0 4px 14px rgba(46, 204, 113, 0.4)' : 'none',
                          }}
                        >
                          {isVerifyingOtp ? '⏳ Verifying...' : '✅ Verify'}
                        </button>
                      </div>

                      {otpError && (
                        <p className="form-error mt-xs" style={{ color: 'var(--color-error)', fontWeight: 600, fontSize: '0.85rem' }}>{otpError}</p>
                      )}
                    </div>
                  )}

                  {errors.reviewer_email && (
                    <p className="form-error mt-sm">{errors.reviewer_email}</p>
                  )}

                  {isFetchingReview && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-gold-light)' }}>
                      🔍 Checking for your previous review...
                    </div>
                  )}

                  {isExistingLoaded && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '10px 14px',
                        background: 'rgba(229, 193, 88, 0.15)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-gold-light)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                      }}
                    >
                      <div>✨ <strong>ನಿಮ್ಮ ಹಿಂದಿನ ಮೌಲ್ಯಮಾಪನ ಸಿಕ್ಕಿದೆ! / Previous evaluation loaded!</strong></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Your previous ratings have been pre-filled below. Submitting will update your scores.
                      </div>
                    </div>
                  )}

                  {isNewReviewNotice && !isExistingLoaded && !isFetchingReview && reviewerEmail && mandalName && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '8px 12px',
                        background: 'rgba(39, 174, 96, 0.12)',
                        border: '1px solid rgba(39, 174, 96, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-success)',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ✨ <strong>ಹೊಸ ಮೌಲ್ಯಮಾಪನ / New Evaluation</strong> — You have not rated this Mandal yet. Please rate it below!
                    </div>
                  )}
                </div>

                {/* Optional Area */}
                <div style={{ marginTop: '1rem' }}>
                  <label
                    htmlFor="area-input"
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Area / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    id="area-input"
                    className="form-input"
                    placeholder="e.g. Gandhi Chowk, Bhagyanagar, Fort Area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    disabled={submitting}
                    style={{ fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* Evaluation Questions */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  className="eval-question-number"
                  style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
                >
                  ಹಂತ 2 • ಮಂಡಳಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ (1-10 ಅಂಕಗಳು) / Step 2 • Rate the Mandal (1 to 10 Points per question)
                </div>

                {EVALUATION_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className={`eval-question ${errors[q.id] ? 'has-error' : ''}`}
                  >
                    <div className="eval-question-number">ಪ್ರಶ್ನೆ / Question {idx + 1} of {EVALUATION_QUESTIONS.length}</div>
                    {/* Bilingual label */}
                    <div className="eval-question-label" style={{ marginBottom: '2px' }}>
                      {(q as Record<string,string>).labelKannada || q.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                      {(q as Record<string,string>).labelEnglish || ''}
                    </div>
                    {/* Bilingual question */}
                    <div className="eval-question-text" style={{ marginBottom: '4px' }}>
                      {q.question}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      {(q as Record<string,string>).questionEnglish || ''}
                    </div>
                    <StarRating
                      value={ratings[q.id] || 0}
                      onChange={(val) => handleRatingChange(q.id, val)}
                      name={q.label}
                      disabled={submitting}
                    />
                    {errors[q.id] && (
                      <p className="form-error mt-sm">{errors[q.id]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Photo Upload (Optional) */}
              <div className="eval-question" style={{ marginBottom: '1.75rem' }}>
                <div className="eval-question-label">ಫೋಟೋ ಸೇರಿಸಿ / Add Mandal Photo (Optional)</div>
                <div className="eval-question-text">ಈ ಗಣೇಶ ಮಂಡಳಿಯ ಸುಂದರ ಫೋಟೋ ಸೇರಿಸಿ (ಐಚ್ಛಿಕ)</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  Upload a photo of this Ganesh Mandal (optional)
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="photo-upload-input"
                    className="form-input"
                    disabled={submitting}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setPhotoPreview(ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }
                    }}
                    style={{
                      padding: '0.65rem 0.9rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  />
                  {photoFile && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(229, 193, 88, 0.1)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      {photoPreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoPreview} alt="Mandal preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-gold)' }} />
                      )}
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--color-gold-light)' }}>
                        📸 <strong>{photoFile.name}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); const el = document.getElementById('photo-upload-input') as HTMLInputElement; if (el) el.value = ''; }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Feedback */}
              <div className="eval-question" style={{ marginBottom: '1.75rem' }}>
                <div className="eval-question-label">ಹೆಚ್ಚುವರಿ ಅಭಿಪ್ರಾಯ / Additional Feedback & Comments</div>
                <div className="eval-question-text">ಈ ಮಂಡಳಿಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಹಂಚಿಕೊಳ್ಳಿ (ಐಚ್ಛಿಕ)</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Share your thoughts or highlights about this mandal (optional)</div>
                <textarea
                  className="form-input form-textarea"
                  placeholder="What did you like best about this Ganesh Mandal?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value.slice(0, APP_CONFIG.feedbackMaxLength))}
                  maxLength={APP_CONFIG.feedbackMaxLength}
                  disabled={submitting}
                  id="feedback-input"
                  aria-label="Additional feedback"
                  rows={3}
                />
                <p className="form-helper">
                  {feedback.length}/{APP_CONFIG.feedbackMaxLength} characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="mt-xl" style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-full"
                  onClick={handleSubmitClick}
                  disabled={submitting}
                  id="submit-evaluation-btn"
                  style={{
                    fontSize: '1.15rem',
                    padding: '1rem 2rem',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  {submitting ? 'Submitting Evaluation...' : 'Submit Evaluation 🙏'}
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Confirm Your Evaluation"
        message={`Are you sure you want to submit your review for "${mandalName.trim()}"?`}
        confirmText="Confirm & Submit"
        cancelText="Edit Details"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
        loading={submitting}
      />
    </div>
  );
}
