import { useEffect, useMemo, useState, useCallback } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
import { getAnimauxByRefuge, getProduitsByRefuge } from '../../services/publicApi'
import { getUtilisateurRefuges, deleteAnimal, deleteProduit, getRefugeOrders, updateOrderStatus, getRefugeDemandesAdoption, updateDemandeAdoptionStatut } from '../../services/authApi'
import { mapRefuges } from '../../hooks/useRefuge'
import { mapAnimals } from '../../hooks/useAnimal'
import { mapProduits } from '../../hooks/useProduits'
import { normalizeApiError } from '../../lib/http'
import { useRoleAccess } from '../../hooks/useRoleAccess'
import Modal from '../../components/ui/Modal'
import AnimalForm from '../../components/forms/AnimalForm'
import ProductForm from '../../components/forms/ProductForm'

const RefugeDashboard = () => {
  const { backendUserId } = useRoleAccess()
  const [isLoading, setIsLoading] = useState(true)
  const [apiIssues, setApiIssues] = useState([])
  const [myRefuges, setMyRefuges] = useState([])
  const [myAnimals, setMyAnimals] = useState([])
  const [myProducts, setMyProducts] = useState([])
  const [myAdoptions, setMyAdoptions] = useState([])
  const [myOrders, setMyOrders] = useState([])

  // Modal réponse adoption
  const [reponseModal, setReponseModal] = useState(null) // { demande, action: 'accepter'|'refuser' }
  const [commentaireRetour, setCommentaireRetour] = useState('')
  const [reponseLoading, setReponseLoading] = useState(false)

  // États pour le CRUD Animaux
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)

  // États pour le CRUD Produits
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (!backendUserId) return
    if (showLoading) setIsLoading(true)
    setApiIssues([])

    try {
      // 1. Récupérer les refuges de l'utilisateur connecté
      const refugesRaw = await getUtilisateurRefuges(backendUserId).catch((e) => {
        normalizeApiError(e)
        return []
      })

      const refugesList = Array.isArray(refugesRaw) ? mapRefuges(refugesRaw) : []
      setMyRefuges(refugesList)

      if (refugesList.length === 0) {
        setIsLoading(false)
        return
      }

      const refugeId = refugesList[0].id

      // 2. Charger animaux, produits, adoptions et commandes en parallèle (filtrés par refuge)
      const [animauxResult, produitsResult, adoptionsResult, ordersResult] = await Promise.allSettled([
        getAnimauxByRefuge(refugeId),
        getProduitsByRefuge(refugeId),
        getRefugeDemandesAdoption(),   // ← vrai endpoint demande_adoption
        getRefugeOrders(),
      ])

      const issues = []

      if (animauxResult.status === 'fulfilled') {
        setMyAnimals(mapAnimals(Array.isArray(animauxResult.value) ? animauxResult.value : []))
      } else {
        issues.push('Animaux')
        normalizeApiError(animauxResult.reason)
      }

      if (produitsResult.status === 'fulfilled') {
        setMyProducts(mapProduits(Array.isArray(produitsResult.value) ? produitsResult.value : []))
      } else {
        issues.push('Produits')
        normalizeApiError(produitsResult.reason)
      }

      if (adoptionsResult.status === 'fulfilled') {
        const allAdoptions = Array.isArray(adoptionsResult.value) ? adoptionsResult.value : []
        setMyAdoptions(allAdoptions)   // déjà filtré par refuge côté backend
      } else {
        issues.push('Adoptions')
        normalizeApiError(adoptionsResult.reason)
      }

      if (ordersResult.status === 'fulfilled') {
        setMyOrders(Array.isArray(ordersResult.value) ? ordersResult.value : [])
      } else {
        issues.push('Commandes')
        normalizeApiError(ordersResult.reason)
      }

      setApiIssues(issues)
    } catch (err) {
      console.error('Erreur dashboard refuge:', err)
      setApiIssues(['Chargement général'])
    } finally {
      setIsLoading(false)
    }
  }, [backendUserId])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const stats = useMemo(() => {
    const urgentAnimals = myAnimals.filter((a) => Boolean(a.urgent)).length
    const lowStockProducts = myProducts.filter((p) => Number(p.Stock ?? p.stock ?? 0) <= 5).length
    const totalStock = myProducts.reduce((sum, p) => sum + Number(p.Stock ?? p.stock ?? 0), 0)
    return {
      refugeCount: myRefuges.length,
      animalCount: myAnimals.length,
      urgentAnimals,
      productCount: myProducts.length,
      lowStockProducts,
      totalStock,
    adoptionPending: myAdoptions.filter(a => {
        const s = String(a.StatutLabel ?? a.Statut ?? '').toLowerCase()
        return s.includes('attente')
      }).length,
      orderCount: myOrders.length,
    }
  }, [myAnimals, myProducts, myRefuges, myAdoptions, myOrders])

  // Handlers Animaux
  const handleDeleteAnimal = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) return
    try {
      await deleteAnimal(id)
      loadDashboardData(false)
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const openAddAnimal = () => { setEditingAnimal(null); setIsAnimalModalOpen(true) }
  const openEditAnimal = (animal) => { setEditingAnimal(animal); setIsAnimalModalOpen(true) }

  // Handlers Produits
  const handleDeleteProduit = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return
    try {
      await deleteProduit(id)
      loadDashboardData(false)
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const openAddProduit = () => { setEditingProduct(null); setIsProductModalOpen(true) }
  const openEditProduit = (product) => { setEditingProduct(product); setIsProductModalOpen(true) }

  // Handlers Adoptions — nouveau endpoint demande_adoption
  const handleRepondreAdoption = async (statut) => {
    if (!reponseModal) return
    setReponseLoading(true)
    try {
      await updateDemandeAdoptionStatut(reponseModal.demande.Id, statut, commentaireRetour)
      
      // Actualisation optimiste pour un retour UI immédiat
      setMyAdoptions(prev => prev.map(d => 
        d.Id === reponseModal.demande.Id 
          ? { ...d, StatutLabel: statut, Statut: statut } 
          : d
      ))

      setReponseModal(null)
      setCommentaireRetour('')
      loadDashboardData(false)
    } catch {
      alert('Erreur lors de la mise à jour')
    } finally {
      setReponseLoading(false)
    }
  }

  // Handlers Commandes
  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      loadDashboardData(false)
    } catch {
      alert('Erreur lors de la mise à jour de la commande')
    }
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          {apiIssues.length > 0 && (
            <div className="inline-block px-3 py-1 bg-[#fff1c2] text-[#7a4a00] border-2 border-black font-bold text-[10px] uppercase tracking-wider mb-3">
              ⚠ Sources indisponibles: {apiIssues.join(', ')}
            </div>
          )}
          <h1 className="font-['Chewy'] text-5xl text-primary">Dashboard Refuge</h1>
          <p className="text-on-surface-variant mt-2">
            Gérez vos animaux, votre boutique refuge et les informations de votre structure.
          </p>
        </div>

        {isLoading && (
          <FadeIn className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-black rounded-xl">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary">Chargement des données...</p>
          </FadeIn>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          {[
            { label: 'Adoptions', value: stats.adoptionPending, color: 'text-secondary' },
            { label: 'Commandes', value: stats.orderCount, color: 'text-tertiary' },
            { label: 'Refuges', value: stats.refugeCount, color: 'text-primary' },
            { label: 'Animaux', value: stats.animalCount, color: 'text-primary' },
            { label: 'Urgences', value: stats.urgentAnimals, color: 'text-error' },
            { label: 'Produits', value: stats.productCount, color: 'text-primary' },
            { label: 'Stock total', value: stats.totalStock, color: 'text-secondary' },
            { label: 'Stock faible', value: stats.lowStockProducts, color: 'text-tertiary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-container-lowest border-4 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs uppercase font-bold text-on-surface-variant">{label}</p>
              <p className={`font-['Chewy'] text-4xl ${color} mt-2`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Informations refuge */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">home_work</span>
              Informations refuge
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRefuges.length === 0 ? (
              <p className="text-sm font-bold text-on-surface-variant col-span-2">
                Aucun refuge associé à ce compte. Contactez un administrateur.
              </p>
            ) : (
              myRefuges.map((refuge) => (
                <div key={refuge.id} className="border-2 border-black rounded-xl p-4 bg-white">
                  <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">{refuge.nom}</p>
                  <p className="text-sm text-on-surface-variant">{refuge.adresse}, {refuge.ville}</p>
                  <p className="text-sm font-bold mt-2">{refuge.telephone}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{refuge.email}</p>
                </div>
              ))
            )}
          </div>
        </FadeIn>

        {/* Demandes d'adoption */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">description</span>
              Demandes d’adoption ({myAdoptions.length})
            </h2>
            {stats.adoptionPending > 0 && (
              <span className="px-2.5 py-0.5 bg-secondary text-white text-xs font-extrabold border border-black rounded-full">
                {stats.adoptionPending} en attente
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container border-b-2 border-black">
                <tr>
                  {['Date', 'Animal', 'Candidat', 'Logement', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {myAdoptions.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant font-bold text-sm">
                    Aucune demande d’adoption pour le moment.
                  </td></tr>
                ) : (
                  myAdoptions.map((adoption, idx) => {
                    const statutLabel = adoption.StatutLabel ?? adoption.Statut ?? ''
                    const isEnAttente = String(statutLabel).toLowerCase().includes('attente')
                    return (
                      <tr key={adoption.Id ? `adop-${adoption.Id}` : `adop-idx-${idx}`} className="hover:bg-surface-container transition-colors">
                        <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                          {adoption.DateDemande
                            ? new Date(adoption.DateDemande).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                        <td className="px-5 py-4 font-bold">{adoption.AnimalNom || `#${adoption.IdAnimal}`}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{adoption.UtilisateurPrenom} {adoption.UtilisateurNom}</span>
                            <span className="text-xs text-on-surface-variant">{adoption.UtilisateurEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs">{adoption.TypeLogement || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black
                            ${isEnAttente ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : String(statutLabel).toLowerCase().includes('accept') ? 'bg-primary-fixed text-on-primary-fixed-variant'
                              : 'bg-error-container text-on-error-container'}`}>
                            {statutLabel || 'En attente'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isEnAttente ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setReponseModal({ demande: adoption, action: 'accepter' }); setCommentaireRetour('') }}
                                className="p-1.5 border border-black bg-primary text-white rounded transition-colors" title="Accepter">
                                <span className="material-symbols-outlined text-base">check</span>
                              </button>
                              <button
                                onClick={() => { setReponseModal({ demande: adoption, action: 'refuser' }); setCommentaireRetour('') }}
                                className="p-1.5 border border-black bg-error text-white rounded transition-colors" title="Refuser">
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                              <button
                                onClick={() => setReponseModal({ demande: adoption, action: 'detail' })}
                                className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" title="Voir détail">
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReponseModal({ demande: adoption, action: 'detail' })}
                              className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" title="Voir détail">
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Animaux CRUD */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">pets</span>
              Animaux ({myAnimals.length})
            </h2>
            <button onClick={openAddAnimal}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              <span className="material-symbols-outlined text-base">add</span>
              Ajouter
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Nom', 'Race', 'Couleur', 'Âge', 'Urgence', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myAnimals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">pets</span>
                    <p className="font-bold text-sm">Aucun animal enregistré dans votre refuge.</p>
                    <button onClick={openAddAnimal} className="mt-3 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm">
                      + Ajouter le premier animal
                    </button>
                  </td>
                </tr>
              ) : (
                myAnimals.map((animal, idx) => (
                  <tr key={animal.id ? `animal-${animal.id}` : `animal-idx-${idx}`} className="hover:bg-surface-container transition-colors">
                    <td className="px-5 py-4 font-bold">{animal.nom}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{animal.race || '—'}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{animal.Couleur || '—'}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{animal.ageLabel}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${animal.urgent ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                        {animal.urgent ? 'Urgent' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditAnimal(animal)}
                          className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" title="Éditer">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDeleteAnimal(animal.id)}
                          className="p-1.5 border border-black hover:bg-error-container rounded transition-colors text-error" title="Supprimer">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </FadeIn>

        {/* Produits CRUD */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">inventory_2</span>
              Produits en stock ({myProducts.length})
            </h2>
            <button onClick={openAddProduit}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              <span className="material-symbols-outlined text-base">add</span>
              Ajouter
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Produit', 'Catégorie', 'Prix', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">inventory_2</span>
                    <p className="font-bold text-sm">Aucun produit enregistré.</p>
                    <button onClick={openAddProduit} className="mt-3 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm">
                      + Ajouter le premier produit
                    </button>
                  </td>
                </tr>
              ) : (
                myProducts.map((product, idx) => {
                  const stock = Number(product.Stock ?? product.stock ?? 0)
                  return (
                    <tr key={product.id ? `product-${product.id}` : `product-idx-${idx}`} className="hover:bg-surface-container transition-colors">
                      <td className="px-5 py-4 font-bold">{product.nom}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{product.categorie}</td>
                      <td className="px-5 py-4 font-extrabold text-primary">{Number(product.prix || 0).toFixed(2)} DZD</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${stock <= 5 ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditProduit(product)}
                            className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" title="Éditer">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDeleteProduit(product.id)}
                            className="p-1.5 border border-black hover:bg-error-container rounded transition-colors text-error" title="Supprimer">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </FadeIn>


        {/* Commandes reçues */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">receipt_long</span>
              Commandes reçues ({myOrders.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['Commande', 'Client', 'Articles', 'Total', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">inbox</span>
                    <p className="font-bold text-sm">Aucune commande reçue.</p>
                  </td>
                </tr>
              ) : (
                myOrders.map((order, idx) => {
                  const sLabel = order.StatutLabel ?? 'En attente'
                  const sKey = sLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                  const isPending = sKey.includes('attente')
                  const isConfirmed = sKey.includes('cours') || sKey.includes('valide')
                  const isShipped = sKey.includes('livraison') || sKey.includes('exped')
                  let badgeCls = 'bg-surface-container text-on-surface'
                  if (isPending) badgeCls = 'bg-tertiary-fixed text-on-tertiary-fixed'
                  if (isConfirmed) badgeCls = 'bg-secondary-fixed text-on-secondary-fixed'
                  if (isShipped || sKey.includes('livr')) badgeCls = 'bg-primary-fixed text-on-primary-fixed-variant'
                  if (sKey.includes('annul')) badgeCls = 'bg-error-container text-on-error-container'
                  return (
                    <tr key={order.sousCommandeId ?? `order-${idx}`} className="hover:bg-surface-container transition-colors">
                      <td className="px-4 py-4 font-bold">#{String(order.commandeId ?? idx + 1).padStart(6, '0')}</td>
                      <td className="px-4 py-4">{order.ClientPrenom} {order.ClientNom}</td>
                      <td className="px-4 py-4 text-on-surface-variant max-w-[200px] truncate">{order.ArticlesDetail || '—'}</td>
                      <td className="px-4 py-4 font-extrabold text-primary">{Number(order.Total_prix || 0).toLocaleString('fr-DZ')} DZD</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${badgeCls}`}>{sLabel}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {isPending && (
                            <button onClick={() => handleUpdateOrderStatus(order.sousCommandeId, 'Validé')}
                              className="px-2 py-1 bg-primary text-white text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                              Confirmer
                            </button>
                          )}
                          {isConfirmed && (
                            <button onClick={() => handleUpdateOrderStatus(order.sousCommandeId, 'En livraison')}
                              className="px-2 py-1 bg-secondary text-white text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                              Expédier
                            </button>
                          )}
                          {isShipped && (
                            <button onClick={() => handleUpdateOrderStatus(order.sousCommandeId, 'Livré')}
                              className="px-2 py-1 bg-green-600 text-white text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                              Livré
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </FadeIn>

        {/* Modal Animaux */}

        <Modal isOpen={isAnimalModalOpen} onClose={() => setIsAnimalModalOpen(false)}
          title={editingAnimal ? `Modifier ${editingAnimal.nom}` : 'Ajouter un animal'} size="lg">
          <AnimalForm initialData={editingAnimal} refugeId={myRefuges[0]?.id}
            onClose={() => setIsAnimalModalOpen(false)} onSuccess={() => loadDashboardData(false)} />
        </Modal>

        {/* Modal Produits */}
        <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}
          title={editingProduct ? `Modifier ${editingProduct.nom}` : 'Ajouter un produit'} size="lg">
          <ProductForm initialData={editingProduct} refugeId={myRefuges[0]?.id}
            onClose={() => setIsProductModalOpen(false)} onSuccess={() => loadDashboardData(false)} />
        </Modal>

        {/* Modal réponse adoption */}
        {reponseModal && (
          <Modal
            isOpen={true}
            onClose={() => { setReponseModal(null); setCommentaireRetour('') }}
            title={reponseModal.action === 'detail' ? 'Détail de la demande' : reponseModal.action === 'accepter' ? 'Accepter la demande' : 'Refuser la demande'}
            size="md"
          >
            <div className="space-y-4">
              {/* Informations demande */}
              <div className="bg-surface-container rounded-xl border-2 border-black p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-on-surface-variant">Animal :</span> <span className="font-bold">{reponseModal.demande.AnimalNom}</span></div>
                  <div><span className="text-on-surface-variant">Candidat :</span> <span className="font-bold">{reponseModal.demande.UtilisateurPrenom} {reponseModal.demande.UtilisateurNom}</span></div>
                  <div><span className="text-on-surface-variant">Email :</span> <span className="font-bold text-xs">{reponseModal.demande.UtilisateurEmail}</span></div>
                  <div><span className="text-on-surface-variant">Logement :</span> <span className="font-bold">{reponseModal.demande.TypeLogement}</span></div>
                  {reponseModal.demande.Jardin && <div><span className="text-on-surface-variant">Extérieur :</span> <span className="font-bold">{reponseModal.demande.Jardin}</span></div>}
                  {reponseModal.demande.Disponibilite && <div className="col-span-2"><span className="text-on-surface-variant">Disponibilité :</span> <span className="font-bold">{reponseModal.demande.Disponibilite}</span></div>}
                  {reponseModal.demande.Animaux && <div className="col-span-2"><span className="text-on-surface-variant">Autres animaux :</span> {reponseModal.demande.Animaux}</div>}
                  {reponseModal.demande.Enfants && <div className="col-span-2"><span className="text-on-surface-variant">Enfants :</span> {reponseModal.demande.Enfants}</div>}
                </div>
                <div className="border-t border-outline-variant pt-2">
                  <p className="text-on-surface-variant text-xs mb-1 font-bold">Motivation :</p>
                  <p className="italic text-on-surface">{reponseModal.demande.CommentaireDepart}</p>
                </div>
              </div>

              {/* Zone réponse (seulement si action = accepter ou refuser) */}
              {reponseModal.action !== 'detail' && (
                <div>
                  <label className="block font-bold text-sm mb-1.5">Commentaire pour le candidat (optionnel)</label>
                  <textarea
                    className="w-full border-2 border-black rounded-lg px-4 py-2.5 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    value={commentaireRetour}
                    onChange={e => setCommentaireRetour(e.target.value)}
                    placeholder={reponseModal.action === 'accepter'
                      ? 'Ex: Votre dossier a retenu notre attention. Pouvez-vous nous contacter pour fixer un rendez-vous ?'
                      : 'Ex: Malheureusement votre logement ne correspond pas aux besoins de cet animal...'}
                  />
                </div>
              )}

              {reponseModal.action !== 'detail' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setReponseModal(null); setCommentaireRetour('') }}
                    className="flex-1 py-3 border-2 border-black font-bold text-sm rounded-lg hover:bg-surface-container transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={() => handleRepondreAdoption(
                      reponseModal.action === 'accepter' ? 'Accepté' : 'Refusé'
                    )}
                    disabled={reponseLoading}
                    className={`flex-1 py-3 text-white font-bold text-sm border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50
                      ${reponseModal.action === 'accepter' ? 'bg-primary' : 'bg-error'}`}>
                    {reponseLoading ? 'En cours...' : reponseModal.action === 'accepter' ? '✔ Accepter' : '✕ Refuser'}
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </PageTransition>
  )
}

export default RefugeDashboard
