import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

export function TrustScoreCard({ score, trust_score, verdict }) {
  // 🔥 Support both props (fix for common DB mismatch issue)
  const rawScore = score ?? trust_score

  // 🧪 Debug (remove later)
  console.log("TrustScoreCard received:", { score, trust_score, rawScore, verdict })

  // ✅ Safe number conversion
  let numScore = Number(rawScore)

  if (!Number.isFinite(numScore)) {
    console.warn("Invalid score received:", rawScore)
    numScore = 0
  }

  // ✅ Clamp between 0–100
  const validScore = Math.min(100, Math.max(0, numScore))

  console.log("TrustScoreCard received:", {
  score,
  trust_score,
  verdict,
  type: typeof score
})
  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Trusted':
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: CheckCircle2,
        }
      case 'Suspicious':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: AlertCircle,
        }
      case 'High Risk':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: XCircle,
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: AlertCircle,
        }
    }
  }

  const verdictStyle = getVerdictColor(verdict || 'Unknown')
  const VerdictIcon = verdictStyle.icon

  return (
    <div className={`${verdictStyle.bg} border-2 ${verdictStyle.border} rounded-xl p-8 max-w-md mx-auto`}>
      <div className="flex items-center gap-4 mb-4">
        <VerdictIcon className={`w-8 h-8 ${verdictStyle.text}`} />
        <h2 className={`text-2xl font-bold ${verdictStyle.text}`}>
          {verdict || 'Unknown'}
        </h2>
      </div>

      <div className="mb-6">
        <div className="text-5xl font-bold text-gray-700">
          {Math.round(validScore)}
          <span className="text-2xl text-gray-500">/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {verdict === 'Trusted'
            ? '✅ Candidate appears genuine and consistent'
            : verdict === 'Suspicious'
              ? '⚠️ Some inconsistencies detected - verify before proceeding'
              : verdict === 'High Risk'
                ? '❌ Multiple red flags - do not proceed without investigation'
                : 'ℹ️ No verdict available'}
        </p>
      </div>
    </div>
  )
}