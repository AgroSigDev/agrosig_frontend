// app/login/page.jsx
import { Suspense } from 'react'
import LoginContent from './LoginContent'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 w-full max-w-md mx-4 text-center border border-emerald-200/60">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
            </div>
          </div>
          <div className="py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="text-emerald-700 mt-4 font-medium">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}