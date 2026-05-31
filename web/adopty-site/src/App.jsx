import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import AdminRouteGuard from './components/AdminRouteGuard'
// SocketProvider : connexion Socket.IO partagée pour toute l'app (pattern identique à CartProvider)
import { SocketProvider } from './context/SocketContext'

// Lazy loading de toutes les pages — structure en sous-dossiers (alignée avec adopty-org)
const Accueil           = lazy(() => import('./pages/Accueil'))
const Animaux           = lazy(() => import('./pages/animaux/Animaux'))
const Boutique          = lazy(() => import('./pages/shop/Boutique'))
const ProductDetail     = lazy(() => import('./pages/shop/ProductDetail'))
const Profil            = lazy(() => import('./pages/profil/Profil'))
const UserProfile       = lazy(() => import('./pages/profil/UserProfile'))
const ProfilPrestataire = lazy(() => import('./pages/profil/ProfilPrestataire'))
const Services          = lazy(() => import('./pages/services/Services'))
const Signalement       = lazy(() => import('./pages/signalement/Signalement'))
const DashboardHub      = lazy(() => import('./pages/dashboard/DashboardHub'))
const APropos           = lazy(() => import('./pages/conserning/APropos'))
const Processus         = lazy(() => import('./pages/conserning/Processus'))
const Auth              = lazy(() => import('./pages/auth/Auth'))
const SsoCallback       = lazy(() => import('./pages/auth/SsoCallback'))
const Paiement          = lazy(() => import('./pages/paiements/Paiement'))
const PaymentSuccess    = lazy(() => import('./pages/paiements/PaymentSuccess'))
const Races             = lazy(() => import('./pages/encyclopedie/Races'))
const Refuges           = lazy(() => import('./pages/refuge/RefugesPublic'))
const RefugeProfile     = lazy(() => import('./pages/refuge/RefugeProfile'))
const Messages          = lazy(() => import('./pages/messagerie/Messages'))

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-xs uppercase tracking-widest animate-pulse">Chargement</p>
    </div>
  </div>
)

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <SocketProvider>
      <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Accueil />} />
          <Route path="/animaux" element={<Animaux />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/boutique/:id" element={<ProductDetail />} />
          <Route path="/profil/:id" element={<Profil />} />
          <Route path="/services" element={<Services />} />
          <Route path="/signalement" element={<Signalement />} />
          <Route
            path="/dashboard"
            element={(
              <AdminRouteGuard>
                <DashboardHub />
              </AdminRouteGuard>
            )}
          />
          <Route path="/apropos" element={<APropos />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mon-profil" element={<UserProfile />} />
          <Route path="/paiement" element={<Paiement />} />
          <Route path="/paiement/success" element={<PaymentSuccess />} />
          <Route path="/races" element={<Races />} />
          <Route path="/refuges" element={<Refuges />} />
          <Route path="/refuge/:id" element={<RefugeProfile />} />
          <Route path="/prestataire/:id" element={<ProfilPrestataire />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/sso-callback" element={<SsoCallback />} />
        </Routes>
      </Suspense>
    </Layout>
    </SocketProvider>
  )
}

export default App
