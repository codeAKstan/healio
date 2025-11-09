export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-[hsl(var(--border))]">
      {children}
    </div>
  )
}
