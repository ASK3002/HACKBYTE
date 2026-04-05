// parserService.js - Resume file parsing
import pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'

export class ParserService {
  async parseResume(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`)
      }

      const fileExtension = path.extname(filePath).toLowerCase()

      if (fileExtension === '.pdf') {
        const text = await this.parsePDF(filePath)
        return text
      } else if (fileExtension === '.txt') {
        const text = await this.parseTXT(filePath)
        return text
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}. Use PDF or TXT.`)
      }
    } catch (error) {
      console.error('❌ Parser error:', error.message)
      throw error
    }
  }

  async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      if (dataBuffer.length === 0) {
        throw new Error('PDF file is empty')
      }
      const data = await pdfParse(dataBuffer)
      if (!data.text) {
        throw new Error('Could not extract text from PDF')
      }
      return data.text
    } catch (error) {
      console.error('❌ PDF parsing error:', error.message)
      throw new Error(`Failed to parse PDF: ${error.message}`)
    }
  }

  async parseTXT(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (!content || content.trim().length === 0) {
        throw new Error('TXT file is empty')
      }
      return content
    } catch (error) {
      console.error('❌ TXT reading error:', error.message)
      throw new Error(`Failed to read TXT file: ${error.message}`)
    }
  }

  extractContactInfo(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i

    // GitHub extraction: matches github.com/username URLs or labeled "GitHub: username" fields
    const githubUrlRegex = /github\.com\/([\w-]+)/i
    const githubLabelRegex = /github[:\s]+([\w-]+)/i
    const githubAtRegex = /@([\w-]+)\s*(?:github|gh)/i

    // Codeforces handle extraction
    const cfUrlRegex = /codeforces\.com\/profile\/([\w-]+)/i
    const cfLabelRegex = /codeforces[:\s]+([\w-]+)/i
    const cfAtRegex = /@([\w-]+)\s*(?:codeforces|cf)/i

    const email = text.match(emailRegex)?.[0]
    const phone = text.match(phoneRegex)?.[0]
    const linkedin = text.match(linkedinRegex)?.[0]

    // Try URL first, then label, then @handle near 'github'
    let github = null
    const urlMatch = text.match(githubUrlRegex)
    if (urlMatch) {
      github = urlMatch[1]
    } else {
      const labelMatch = text.match(githubLabelRegex)
      if (labelMatch) {
        github = labelMatch[1]
      } else {
        const atMatch = text.match(githubAtRegex)
        if (atMatch) {
          github = atMatch[1]
        }
      }
    }

    // Extract Codeforces handle
    let codeforces = null
    const cfUrlMatch = text.match(cfUrlRegex)
    if (cfUrlMatch) {
      codeforces = cfUrlMatch[1]
    } else {
      const cfLabelMatch = text.match(cfLabelRegex)
      if (cfLabelMatch) {
        codeforces = cfLabelMatch[1]
      } else {
        const cfAtMatch = text.match(cfAtRegex)
        if (cfAtMatch) {
          codeforces = cfAtMatch[1]
        }
      }
    }

    // Extract claimed Codeforces rank from resume text
    const cfClaimedRank = this.extractCodeforcesClaimedRank(text)

    return {
      email,
      phone,
      linkedin,
      github,
      codeforces,
      cfClaimedRank,
    }
  }

  /**
   * Looks for Codeforces rank keywords near the word "codeforces" in resume text.
   * Ranks searched (case-insensitive): Legendary Grandmaster, International Grandmaster,
   * Grandmaster, International Master, Master, Candidate Master, Expert, Specialist, Pupil, Newbie
   */
  extractCodeforcesClaimedRank(text) {
    if (!text) return null
    // Ordered longest-first to avoid partial matches (e.g. "Grandmaster" before "Master")
    const CF_RANKS = [
      'legendary grandmaster',
      'international grandmaster',
      'grandmaster',
      'international master',
      'candidate master',
      'master',
      'expert',
      'specialist',
      'pupil',
      'newbie',
    ]

    const lowerText = text.toLowerCase()

    // Strategy 1: rank keyword within ~80 chars of the word "codeforces"
    const cfIdx = lowerText.indexOf('codeforces')
    if (cfIdx !== -1) {
      const window = lowerText.substring(Math.max(0, cfIdx - 80), cfIdx + 120)
      for (const rank of CF_RANKS) {
        if (window.includes(rank)) {
          return rank
        }
      }
    }

    // Strategy 2: rank keyword anywhere in the resume (broad fallback — only if resume also mentions codeforces)
    if (cfIdx !== -1) {
      for (const rank of CF_RANKS) {
        if (lowerText.includes(rank)) {
          return rank
        }
      }
    }

    return null
  }

  extractSections(text) {
    const sections = {}

    const sectionPatterns = {
      skills: /skills[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      experience: /experience[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      education: /education[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      projects: /projects[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
      certifications:
        /certifications[:\s]*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i,
    }

    Object.keys(sectionPatterns).forEach((key) => {
      const match = text.match(sectionPatterns[key])
      sections[key] = match ? match[1].trim() : ''
    })

    return sections
  }
}

export const parserService = new ParserService()