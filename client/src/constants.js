// client/src/constants.js - Frontend constants

export const VERDICT_COLORS = {
  Trusted: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
  },
  Suspicious: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
  },
  'High Risk': {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
  },
}

export const SCORE_THRESHOLDS = {
  TRUSTED: 75,
  SUSPICIOUS: 50,
  HIGH_RISK: 0,
}

export const API_ENDPOINTS = {
  ANALYZE: '/trust/analyze',
  UPLOAD_RESUME: '/trust/upload-resume',
  GET_GITHUB: '/trust/github',
  GET_CANDIDATES: '/trust/candidates',
  GET_CANDIDATE: '/trust/candidates/:id',
}

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'text/plain'],
  ALLOWED_EXTENSIONS: ['pdf', 'txt'],
}
