import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useNotifications } from '../context/NotificationContext'
import { UserButton, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'
import { useRoleAccess, ROLE_KEYS } from '../hooks/useRoleAccess'
import Messages from '../pages/messagerie/Messages'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isSignedIn, isLoaded, signOut } = useAuth()
  const { cartItems, totalItems, removeFromCart, totalPrice } = useCart()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [cartOpen, setCartOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const { canAccessDashboard, role, loading: rolesLoading } = useRoleAccess()

  const isAuthPage = location.pathname === '/auth'
  const isInitialLoading = !isLoaded || (isSignedIn && rolesLoading)

  useEffect(() => {
    if (cartOpen || notificationsOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, notificationsOpen, mobileMenuOpen])

  useEffect(() => {
    const handleOpenMessaging = () => setMessagesOpen(true)
    window.addEventListener('open-messaging', handleOpenMessaging)
    return () => window.removeEventListener('open-messaging', handleOpenMessaging)
  }, [])

  useEffect(() => {
    // Si Clerk est chargé et que c'est l'ouverture d'un nouvel onglet,
    // on force la déconnexion pour que la session ne soit pas sauvegardée entre deux onglets/navigateurs
    if (isLoaded) {
      if (!sessionStorage.getItem('app_initialized')) {
        sessionStorage.setItem('app_initialized', 'true')
        if (isSignedIn) {
          signOut()
        }
      }
    }
  }, [isLoaded, isSignedIn, signOut])

  const dashboardByRole = {
    [ROLE_KEYS.ADMIN]: { title: 'Dashboard Admin', label: 'Dashboard', icon: 'admin_panel_settings' },
    [ROLE_KEYS.REFUGE]: { title: 'Dashboard Refuge', label: 'Dashboard', icon: 'home_work' },
    [ROLE_KEYS.PRESTATAIRE]: { title: 'Dashboard Prestataire', label: 'Dashboard', icon: 'handshake' },
  }

  const dashboardMeta = dashboardByRole[role] || {
    title: 'Dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
  }

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/animaux', label: 'Nos Animaux' },
    { to: '/refuges', label: 'Nos Refuges' },
    { to: '/races', label: 'Encyclopédie' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/services', label: 'Services' },
    { to: '/apropos', label: 'À propos' },
    { to: '/signalement', label: 'Signaler' },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const handleCheckout = () => {
    setCartOpen(false)

    if (isSignedIn) {
      navigate('/paiement')
      return
    }

    navigate('/auth', { state: { from: '/paiement' } })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <span className="material-symbols-outlined text-secondary">check_circle</span>
      case 'warning': return <span className="material-symbols-outlined text-warning">warning</span>
      case 'info':
      default: return <span className="material-symbols-outlined text-primary">info</span>
    }
  }

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return `Il y a ${Math.floor(diff / 86400)} j`
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Overlay de chargement initial pour éviter le flash d'UI non chargée */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-[#fbfbe2] flex flex-col items-center justify-center"
          >
             <div className="font-['Chewy'] text-6xl text-primary mb-4 animate-bounce">Adopty</div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-secondary rounded-full animate-bounce"></div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbfbe2] border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(21,66,18,1)]">
        <nav className="flex justify-between items-center w-full px-6 py-3 max-w-full mx-auto">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="font-['Chewy'] text-3xl text-primary hover:scale-105 transition-transform flex-shrink-0"
          >
            Adopty
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-['Plus_Jakarta_Sans'] font-bold text-sm px-3 py-2 rounded-lg transition-all
                  ${link.to === '/signalement'
                    ? 'text-white bg-[#ba1a1a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ml-2'
                    : isActive(link.to)
                      ? 'text-primary bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'text-primary/70 hover:text-primary hover:bg-surface-container'
                  }`}
              >
                {link.to === '/signalement' && (
                  <span className="material-symbols-outlined text-base align-middle mr-1" style={{ fontSize: '14px' }}>warning</span>
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            {isSignedIn && !isAuthPage && (
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-lg hover:bg-surface-container transition-colors border-2 border-transparent hover:border-black"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-primary text-2xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-extrabold rounded-full border-2 border-black flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Panier */}
            {isSignedIn && !isAuthPage && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-surface-container transition-colors border-2 border-transparent hover:border-black"
                title="Panier"
              >
                <span className="material-symbols-outlined text-primary text-2xl">shopping_basket</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs font-extrabold rounded-full border-2 border-black flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            )}

            {canAccessDashboard && (
              <Link to="/dashboard" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all" title={dashboardMeta.title}>
                <span className="material-symbols-outlined text-primary text-xl">{dashboardMeta.icon}</span>
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-primary uppercase">{dashboardMeta.label}</span>
              </Link>
            )}

            {/* Profil / Auth */}
            <div className="hidden md:block">
              <SignedOut>
                {!isAuthPage && (
                  <Link to="/auth" className="flex items-center gap-2 bg-primary text-white font-['Plus_Jakarta_Sans'] font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm">
                    <span className="material-symbols-outlined text-sm">login</span> Connexion
                  </Link>
                )}
              </SignedOut>
              <SignedIn>
                {!isAuthPage && (
                  <Link to="/mon-profil" className="flex items-center gap-2 bg-surface-container-high text-primary font-['Plus_Jakarta_Sans'] font-bold px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm rounded-full">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" } }} />
                    Profil
                  </Link>
                )}
              </SignedIn>
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(v => !v)} className="lg:hidden p-2 border-2 border-black hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-4 border-black bg-[#fbfbe2] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block font-bold py-2.5 px-4 border-2 border-black transition-all text-sm
                      ${link.to === '/signalement'
                        ? 'bg-[#ba1a1a] text-white'
                        : isActive(link.to)
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-container'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 mt-2 border-t-2 border-black/10 space-y-2">
                  {canAccessDashboard && (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-surface-container text-primary font-bold py-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                      <span className="material-symbols-outlined text-base align-middle mr-2">{dashboardMeta.icon}</span>
                      {dashboardMeta.title}
                    </Link>
                  )}
                  <SignedOut>
                    {!isAuthPage && (
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-primary text-white font-bold py-3 border-2 border-black">
                        Se connecter
                      </Link>
                    )}
                  </SignedOut>
                  <SignedIn>
                    {!isAuthPage && (
                      <Link to="/mon-profil" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-surface-container-high text-primary font-bold py-3 border-2 border-black">
                        Mon Profil
                      </Link>
                    )}
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN */}
      <main className="flex-1 pt-[72px]">
        {children || <Outlet />}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#154212] text-[#fbfbe2] border-t-4 border-black mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-start px-8 py-16 w-full max-w-7xl mx-auto gap-12">
          <div className="max-w-xs">
            <span className="font-['Chewy'] text-4xl text-[#fbfbe2] mb-4 block">Adopty</span>
            <p className="font-['Sora'] text-sm text-[#fbfbe2]/80 leading-relaxed">
              L'Éveil Naturel de l'adoption animale. Nous transformons des vies, une patte à la fois.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 border-2 border-[#fbfbe2]/40 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a href="#" className="w-10 h-10 border-2 border-[#fbfbe2]/40 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-colors rounded-lg">
                <span className="material-symbols-outlined text-sm">public</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider text-secondary-fixed">Navigation</h4>
              <ul className="font-['Sora'] text-sm space-y-2">
                {navLinks.slice(0, 4).map(l => (
                  <li key={l.to}><Link to={l.to} className="text-[#fbfbe2]/80 hover:text-secondary-container transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider text-secondary-fixed">Informations</h4>
              <ul className="font-['Sora'] text-sm space-y-2">
                {['Mentions Légales', 'Confidentialité', 'FAQ', 'Partenaires'].map(l => (
                  <li key={l}><a href="#" className="text-[#fbfbe2]/80 hover:text-secondary-container transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-surface-container-highest/10 p-6 border-2 border-dashed border-[#fbfbe2]/20 rounded-xl">
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider mb-4">Restez informé</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email..." className="bg-transparent border-2 border-[#fbfbe2]/40 px-4 py-2 text-sm focus:outline-none focus:bg-[#fbfbe2]/10 text-[#fbfbe2] placeholder-[#fbfbe2]/40 rounded-lg flex-1" />
              <button className="bg-secondary text-white px-4 py-2 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#fbfbe2]/10 py-6 px-8 text-center max-w-7xl mx-auto">
          <p className="font-['Sora'] text-xs text-[#fbfbe2]/50">© 2024 Adopty - L'Éveil Naturel. Tous droits réservés.</p>
        </div>
      </footer>

      {/* NOTIFICATIONS DRAWER */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            onClick={() => setNotificationsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#fbfbe2] border-l-4 border-black flex flex-col shadow-[-8px_0_0_0_rgba(0,0,0,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">notifications</span>
                  Notifications {unreadCount > 0 && <span className="bg-error text-white text-sm px-2 py-0.5 rounded-full border border-black">{unreadCount}</span>}
                </h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-bold text-primary underline mr-2">
                      Tout marquer lu
                    </button>
                  )}
                  <button onClick={() => setNotificationsOpen(false)} className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">notifications_active</span>
                    <p className="font-bold text-lg">Aucune notification</p>
                    <p className="text-sm mt-2 opacity-80">Vous êtes à jour !</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`relative p-4 border-2 border-black rounded-xl transition-colors cursor-pointer
                        ${notification.read ? 'bg-surface-container-lowest opacity-70' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      {!notification.read && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-error rounded-full border border-black"></span>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-primary">{notification.title}</p>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notification.message}</p>
                          <p className="text-[10px] font-bold text-primary/50 mt-2 uppercase tracking-wider">{formatNotificationTime(notification.date)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }} 
                        className="absolute bottom-3 right-3 p-1.5 border border-black/20 hover:bg-error-container hover:border-error text-error rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            onClick={() => setCartOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#fbfbe2] border-l-4 border-black flex flex-col shadow-[-8px_0_0_0_rgba(0,0,0,0.3)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container">
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">shopping_basket</span>
                  Panier {totalItems > 0 && <span className="bg-secondary text-white text-sm px-2 py-0.5 rounded-full border border-black">{totalItems}</span>}
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">shopping_basket</span>
                    <p className="font-bold text-lg">Votre panier est vide</p>
                    <Link to="/boutique" onClick={() => setCartOpen(false)} className="mt-4 inline-block text-sm font-bold text-primary underline">
                      Découvrir la boutique →
                    </Link>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border-2 border-black rounded-xl">
                      <img src={item.photo} alt={item.nom} className="w-16 h-16 object-cover border-2 border-black rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm truncate">{item.nom}</p>
                        <p className="text-xs text-on-surface-variant">{item.categorie}</p>
                        <p className="font-extrabold text-primary mt-1">{item.prix.toFixed(2)}€ × {item.qty}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 border border-black hover:bg-error-container text-error rounded transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 border-t-4 border-black space-y-3">
                  <div className="flex justify-between text-lg font-['Plus_Jakarta_Sans'] font-extrabold">
                    <span>Total</span>
                    <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-primary text-white text-center font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all block"
                  >
                    Commander →
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING MESSAGING BUTTON */}
      {isSignedIn && !isAuthPage && (
        <button
          onClick={() => setMessagesOpen(true)}
          className="fixed bottom-6 left-6 z-[150] w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          title="Ouvrir la messagerie"
        >
          <span className="material-symbols-outlined text-3xl">chat</span>
          {/* Optionnel: un petit badge si on veut afficher le nb de messages non lus */}
        </button>
      )}

      {/* MESSAGING DRAWER */}
      <Messages isOpen={messagesOpen} onClose={() => setMessagesOpen(false)} />
    </div>
  )
}

export default Layout
