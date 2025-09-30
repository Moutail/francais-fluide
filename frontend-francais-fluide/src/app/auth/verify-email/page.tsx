'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      setIsVerifying(true);
      setError('');

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setIsVerified(true);
          setMessage('Votre email a été vérifié avec succès !');
          // Redirection après 3 secondes
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setError(data.error || 'Erreur lors de la vérification');
        }
      } catch (err) {
        setError('Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, router]);

  const resendVerification = async () => {
    if (!email) {
      setError('Email manquant pour renvoyer la vérification');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resend: true }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Email de vérification renvoyé !');
      } else {
        setError(data.error || 'Erreur lors du renvoi');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Email vérifié !</h1>
            <p className="mb-6 text-gray-600">{message}</p>
            <p className="mb-6 text-sm text-gray-500">Redirection vers votre tableau de bord...</p>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Vérification d'email</h1>
          <p className="text-gray-600">
            {email ? `Vérifiez votre email: ${email}` : 'Vérifiez votre adresse email'}
          </p>
        </div>

        {/* Contenu principal */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
          {isVerifying ? (
            <div>
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Vérification en cours...</h2>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </div>
          ) : (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>

              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Vérifiez votre boîte de réception
              </h2>

              <p className="mb-6 text-gray-600">
                Nous avons envoyé un lien de vérification à votre adresse email. Cliquez sur le lien
                pour activer votre compte.
              </p>

              {/* Message de succès ou d'erreur */}
              {message && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {email && (
                  <button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Renvoi en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Renvoyer l'email
                      </>
                    )}
                  </button>
                )}

                <a
                  href="/auth/login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </a>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>Vous n'avez pas reçu l'email ?</p>
                <p>Vérifiez votre dossier spam ou contactez le support.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
