import './globals.css'
import Header from './components/Header'

export const metadata = {
  title: 'Sistema de Abrigos - Acolhe +',
  description: 'Plataforma de gestão de abrigos para enchentes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}