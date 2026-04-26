import './globals.css'
import Header from './components/Header'

export const metadata = {
  title: 'Sistema de Abrigos - Enchentes RS',
  description: 'Plataforma de gestão de abrigos para enchentes no Rio Grande do Sul',
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