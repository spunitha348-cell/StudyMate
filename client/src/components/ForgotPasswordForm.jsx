import { useState } from 'react'
import { api } from '../services/api'

/**
 * Same-page flow: verify email → set new password → prompt to sign in again.
 * Works for both students and faculty (same accounts table).
 */
function ForgotPasswordForm({ onBackToSignIn }) {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [doneMessage, setDoneMessage] = useState('')

  const handleCheckEmail = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.forgotPasswordCheckEmail(email.trim())
      if (res.exists) {
        setStep('password')
      } else {
        setError('No account found with this email.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await api.forgotPasswordReset(email.trim(), newPassword, confirmPassword)
      setDoneMessage(res.detail || 'Password updated. Please sign in with your new password.')
      setStep('done')
    } catch (err) {
      setError(err.message || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {doneMessage}
        </div>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  if (step === 'password') {
    return (
      <form onSubmit={handleReset} className="space-y-6">
        <p className="text-sm text-gray-600">
          Account found for <span className="font-medium text-gray-900">{email}</span>. Enter your new password below.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}
        <div>
          <label htmlFor="fp-new" className="block text-sm font-semibold text-gray-700 mb-2">
            New password
          </label>
          <input
            id="fp-new"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="fp-confirm" className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm new password
          </label>
          <input
            id="fp-confirm"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save new password'}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep('email')
            setNewPassword('')
            setConfirmPassword('')
            setError('')
          }}
          className="w-full text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          ← Use a different email
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleCheckEmail} className="space-y-6">
      <p className="text-sm text-gray-600">
        Enter the email address for your account. If it exists, you can set a new password on the next step.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label htmlFor="fp-email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <input
          id="fp-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Your account email"
          autoComplete="email"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Continue'}
      </button>
      <button type="button" onClick={onBackToSignIn} className="w-full text-indigo-600 hover:text-indigo-700 text-sm font-medium">
        ← Back to sign in
      </button>
    </form>
  )
}

export default ForgotPasswordForm
