// pages/CandidateProfile.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CommonNavbar } from '../components/CommonNavbar'
import { trustAPI } from '../services/api'
import { TrustScoreCard } from '../components/TrustScoreCard'
import { BreakdownBar } from '../components/BreakdownBar'
import { FlagsPanel } from '../components/FlagsPanel'
import { ExplanationPanel } from '../components/ExplanationPanel'
import { WorkAuthBadge } from '../components/WorkAuthBadge'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function CandidateProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const data = await trustAPI.getCandidateById(id)
        setCandidate(data)
      } catch (err) {
        setError('Failed to load candidate profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidate()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline font-medium flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Candidate not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <CommonNavbar />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline font-medium flex items-center gap-1 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Profile
          </h1>
          {/* Work Experience Verification Badge */}
          <div className="mt-3">
            <WorkAuthBadge resumeId={candidate?.id} showDetail={true} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Results Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Trust Score Card & Extra Verifications */}
          <div className="md:col-span-1 space-y-6">
            <TrustScoreCard
              score={candidate.trust_score}
              verdict={candidate.verdict}
            />

            {/* Codeforces Verification Card */}
            {candidate.codeforcesData && (
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Codeforces
                  </h3>
                {/* Verified icon if rank is legit, else warn */}
                {(!candidate.cfClaimedRank || 
                  !candidate.flags?.some(f => f.includes('Codeforces'))) ? (
                  <span className="text-green-500 text-sm font-medium flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">
                    🚩 Mismatch
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Handle: <a href={`https://codeforces.com/profile/${candidate.codeforcesData.handle}`} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">{candidate.codeforcesData.handle}</a>
              </p>
              
              {(!candidate.cfClaimedRank || !candidate.flags?.some(f => f.includes('Codeforces'))) ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-500">Max Rank</span>
                    <span className="font-medium capitalize">{candidate.codeforcesData.maxRank || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-500">Max Rating</span>
                    <span className="font-medium">{candidate.codeforcesData.maxRating || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                  <b>Mismatch detected!</b><br/>Claimed rank <b>{candidate.cfClaimedRank}</b> does not match actual maximum rank <b>{candidate.codeforcesData.maxRank}</b>.
                </div>
              )}
            </div>
            )}
          </div>

          {/* Breakdown Scores */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">
              Score Breakdown
            </h3>
            <BreakdownBar
              label="Skills Verification"
              score={candidate.breakdown.skills}
            />
            <BreakdownBar
              label="Projects & Portfolio"
              score={candidate.breakdown.projects}
            />
            <BreakdownBar
              label="Experience Consistency"
              score={candidate.breakdown.experience}
            />
          </div>
        </div>

        {/* Red Flags */}
        <div className="bg-white rounded-lg shadow p-6">
          <FlagsPanel flags={candidate.flags} />
        </div>

        {/* Explanation */}
        <ExplanationPanel explanation={candidate.explanation} />

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Analysis Information
          </h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Analyzed On</dt>
              <dd className="font-medium text-gray-700">
                {new Date(candidate.timestamp).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Analysis ID</dt>
              <dd className="font-medium text-gray-700 font-mono text-xs">
                {candidate.id}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
