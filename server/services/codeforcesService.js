// codeforcesService.js - Codeforces API integration
import axios from 'axios'

// Ordered from lowest to highest tier
const RANK_TIERS = [
  'newbie',
  'pupil',
  'specialist',
  'expert',
  'candidate master',
  'master',
  'international master',
  'grandmaster',
  'international grandmaster',
  'legendary grandmaster',
]

class CodeforcesService {
  constructor() {
    this.baseURL = 'https://codeforces.com/api'
  }

  /**
   * Returns numeric tier index of a rank string (case-insensitive).
   * Returns -1 if unknown.
   */
  getRankTier(rankStr) {
    if (!rankStr) return -1
    const normalized = rankStr.toLowerCase().trim()
    const idx = RANK_TIERS.indexOf(normalized)
    return idx
  }

  /**
   * Fetches user info from Codeforces API.
   * Returns { handle, maxRating, maxRank, currentRating, currentRank } or null on failure.
   */
  async fetchUserData(handle) {
    try {
      if (!handle) return null

      console.log(`\n🏆 ===== CODEFORCES LOOKUP =====`)
      console.log(`   Handle: ${handle}`)

      const response = await axios.get(`${this.baseURL}/user.info`, {
        params: { handles: handle },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 8000,
      })

      if (response.data?.status !== 'OK' || !response.data?.result?.length) {
        console.warn(`⚠️  [Codeforces] No user found for handle: ${handle}`)
        return null
      }

      const user = response.data.result[0]

      const result = {
        handle: user.handle,
        maxRating: user.maxRating ?? null,
        maxRank: user.maxRank ?? null,
        currentRating: user.rating ?? null,
        currentRank: user.rank ?? null,
        titlePhoto: user.titlePhoto ?? null,
      }

      console.log(`   Max Rating : ${result.maxRating}`)
      console.log(`   Max Rank   : ${result.maxRank}`)
      console.log(`   Curr Rating: ${result.currentRating}`)
      console.log(`   Curr Rank  : ${result.currentRank}`)
      console.log(`================================\n`)

      return result
    } catch (error) {
      if (error.response?.status === 400) {
        console.warn(`⚠️  [Codeforces] Invalid handle: ${handle}`)
      } else {
        console.error(`❌ [Codeforces] API error: ${error.message}`)
      }
      return null
    }
  }

  /**
   * Compares a claimed rank against the actual maxRank from Codeforces.
   * Returns:
   *   { verified: true }  — actual maxRank >= claimed rank
   *   { verified: false, flag: "..." } — actual maxRank < claimed rank (red flag)
   *   { verified: null }  — claimed rank not found or data unavailable
   */
  verifyRank(claimedRank, codeforcesData) {
    if (!claimedRank || !codeforcesData?.maxRank) {
      return { verified: null }
    }

    const claimedTier = this.getRankTier(claimedRank)
    const actualTier = this.getRankTier(codeforcesData.maxRank)

    if (claimedTier === -1 || actualTier === -1) {
      console.warn(`⚠️  [Codeforces] Could not compare ranks: claimed="${claimedRank}" actual="${codeforcesData.maxRank}"`)
      return { verified: null }
    }

    if (actualTier >= claimedTier) {
      console.log(`✅ [Codeforces] Rank VERIFIED: actual "${codeforcesData.maxRank}" >= claimed "${claimedRank}"`)
      return { verified: true }
    } else {
      const flag = `Codeforces rank mismatch: resume claims "${claimedRank}" but actual max rank is "${codeforcesData.maxRank}" (max rating: ${codeforcesData.maxRating})`
      console.warn(`🚩 [Codeforces] Rank MISMATCH: ${flag}`)
      return { verified: false, flag }
    }
  }
}

export const codeforcesService = new CodeforcesService()
