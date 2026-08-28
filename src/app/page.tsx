'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import ConfirmDialog from '@/components/ConfirmDialog';
import { EVALUATION_QUESTIONS, APP_CONFIG } from '@/lib/config';
import { submitReview } from '@/app/actions/reviews';
import { searchExistingMandals } from '@/app/actions/mandals';
import type { ReviewFormData } from '@/types/database';

type RatingKey = typeof EVALUATION_QUESTIONS[number]['id'];

interface MandalSuggestion {
  id: string;
  name: string;
  area: string;
}

export default function HomeEvaluationPage() {
  const [mandalName, setMandalName] = useState('');
  const [area, setArea] = useState('');
  const [selectedMandalId, setSelectedMandalId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MandalSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({} as Record<RatingKey, number>);
  const [feedback, setFeedback] = useState('');
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!mandalName.trim()) {
      newErrors.mandal_name = 'Please enter the Ganesh Mandal name.';
    }

    for (const q of EVALUATION_QUESTIONS) {
      if (!ratings[q.id] || ratings[q.id] < 1 || ratings[q.id] > 5) {
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
        idol_rating: ratings.idol_rating,
        decoration_rating: ratings.decoration_rating,
        lighting_rating: ratings.lighting_rating,
        creativity_rating: ratings.creativity_rating,
        cleanliness_rating: ratings.cleanliness_rating,
        eco_friendly_rating: ratings.eco_friendly_rating,
        cultural_rating: ratings.cultural_rating,
        overall_rating: ratings.overall_rating,
        feedback: feedback.trim() || undefined,
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
    setSelectedMandalId(null);
    setRatings({} as Record<RatingKey, number>);
    setFeedback('');
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
              <div className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>🙏 ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ 🙏</div>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.3, marginBottom: '0.35rem' }}>
                  {APP_CONFIG.appName}
                </h1>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.15rem' }}>
                  {APP_CONFIG.appNameEnglish}
                </p>
                <p style={{ color: 'var(--color-orange)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>
                  {APP_CONFIG.organizer}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  {APP_CONFIG.organizerEnglish}
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  background: 'linear-gradient(135deg, var(--color-orange), var(--color-deep-red))',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
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
                  background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.08), rgba(232, 117, 26, 0.04))',
                  border: '1.5px solid var(--color-gold)',
                  marginBottom: '1.75rem',
                }}
              >
                <div className="eval-question-number" style={{ color: 'var(--color-orange)' }}>
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
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid var(--color-gold)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 50,
                        maxHeight: '260px',
                        overflowY: 'auto',
                      }}
                    >
                      <div
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--color-gold-dark)',
                          background: 'rgba(212, 168, 67, 0.08)',
                          borderBottom: '1px solid var(--color-border-light)',
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
                            e.currentTarget.style.background = 'rgba(212, 168, 67, 0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                              🏛️ {item.name}
                            </div>
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
                              background: 'rgba(39, 174, 96, 0.12)',
                              color: 'var(--color-success)',
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

                {/* Selected existing mandal indicator badge */}
                {selectedMandalId && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '6px 12px',
                      background: 'rgba(39, 174, 96, 0.1)',
                      border: '1px solid rgba(39, 174, 96, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: 'var(--color-success)',
                    }}
                  >
                    <span>✓ Linked to existing mandal in database</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMandalId(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                      }}
                    >
                      Unlink
                    </button>
                  </div>
                )}

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
                  ಹಂತ 2 • ಮಂಡಳಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ / Step 2 • Rate the Mandal (1 to 5 Stars)
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
