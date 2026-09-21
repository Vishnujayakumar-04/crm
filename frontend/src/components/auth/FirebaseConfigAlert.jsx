import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react'

export default function FirebaseConfigAlert() {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const envTemplate = `# Create a .env.local file in the project root with:
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef`

  function handleCopy() {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              Firebase Project Credentials Required
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              To connect real Firebase Authentication, create a <code>.env.local</code> file in your project root with your Firebase Web App credentials.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-700 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:bg-amber-900/40"
          aria-label={expanded ? 'Collapse setup instructions' : 'Expand setup instructions'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/50 text-xs space-y-3">
          <ol className="list-decimal list-inside space-y-1.5 text-amber-900 dark:text-amber-200">
            <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">Firebase Console <ExternalLink size={11} /></a>.</li>
            <li>Create or select your project and enable <strong>Authentication → Sign-in method → Email/Password</strong>.</li>
            <li>Go to <strong>Project Settings → General → Your apps</strong>, add a Web App, and copy the config values.</li>
            <li>Create a file named <code>.env.local</code> in the root directory (<code>crm/</code>) and paste the values below.</li>
          </ol>

          <div className="relative rounded-xl bg-gray-900 p-3 text-gray-200 font-mono text-[11px] overflow-x-auto">
            <button
              onClick={handleCopy}
              className="absolute right-2 top-2 flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-[10px] text-gray-300 hover:bg-gray-700"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <pre>{envTemplate}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
