import { FadeIn } from '../Animations'
import { useCart } from '../../context/CartContext'
import Badge from './Badge'
import { useRequireAuthAction } from '../../hooks/useRequireAuthAction'
import { useRoleAccess } from '../../hooks/useRoleAccess'
import { Link } from 'react-router-dom'

/**
 * ProductCard
 *
 * Règle anti-réflexivité :
 *  - Un refuge ne peut PAS acheter ses propres produits.
 *
 * Prop optionnelle `ownedRefugeId` : l'ID refuge de l'utilisateur connecté (si refuge manager).
 * Si `produit.idRefuge === ownedRefugeId` → bouton "Ajouter au panier" masqué.
 */
const ProductCard = ({ produit, delay = 0, ownedRefugeId = null }) => {
  const { addToCart }         = useCart()
  const { requireAuthAction } = useRequireAuthAction()
  const { isRefuge }          = useRoleAccess()

  // Anti-réflexivité : refuge ne peut pas acheter ses propres produits
  const isSelfProduct = isRefuge
    && ownedRefugeId
    && String(ownedRefugeId) === String(produit.idRefuge)

  return (
    <FadeIn delay={delay} className="group bg-surface-container-lowest border-[3px] border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200 flex flex-col">
      <Link to={`/boutique/${produit.id}`} className="flex flex-col h-full">
        <div className="relative h-56 overflow-hidden border-b-[3px] border-black">
          <img
            alt={produit.nom}
            src={produit.photo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {produit.badge && (
            <Badge variant="eco" className="absolute top-3 left-3">{produit.badge}</Badge>
          )}
          {isSelfProduct && (
            <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-3">
              <span className="text-white text-[10px] font-extrabold bg-black/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Votre produit
              </span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">{produit.categorie}</span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl mb-2 text-primary group-hover:underline">{produit.nom}</h3>
          <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-grow">{produit.description}</p>
        </div>
      </Link>

      <div className="px-5 pb-5 mt-auto flex items-center justify-between gap-3">
        <div>
          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary">
            {Number(produit.prix || 0).toLocaleString('fr-FR')} DZD
          </span>
        </div>
        {isSelfProduct ? (
          /* Refuge manager — ne peut pas acheter son propre produit */
          <span title="Vous ne pouvez pas acheter vos propres produits"
            className="p-2.5 border-2 border-black rounded-full bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-xl">block</span>
          </span>
        ) : (
          <button
            onClick={() => requireAuthAction(() => addToCart(produit))}
            disabled={produit.stock === 0}
            className="bg-primary text-white p-2.5 border-2 border-black rounded-full hover:bg-secondary transition-colors active:scale-90 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed"
            title={produit.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          >
            <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
          </button>
        )}
      </div>
    </FadeIn>
  )
}

export default ProductCard
