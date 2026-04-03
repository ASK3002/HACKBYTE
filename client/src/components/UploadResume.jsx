// components/UploadResume.jsx
import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'

export function UploadResume({ onAnalyze }) {
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [githubUsername, setGithubUsername] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!resumeFile || !githubUsername.trim()) {
      alert('Please provide both resume and GitHub username')
      return
    }

    setIsLoading(true)
    try {
      await onAnalyze(resumeFile, githubUsername)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Upload Resume
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-blue-500" />
              <p className="text-gray-600 font-medium">
                {resumeFile ? resumeFile.name : 'Click to upload or drag resume (PDF/TXT)'}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="hidden"
            />
          </div>
        </div>

        {/* GitHub Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            GitHub Username
          </label>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="e.g., torvalds"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to skip GitHub analysis
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !resumeFile}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Profile'
          )}
        </button>
      </form>
    </div>
  )
}
