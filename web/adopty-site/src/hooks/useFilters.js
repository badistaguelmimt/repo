/**
 * useFilters.js
 * Gère les filtres de recherche des animaux.
 * La logique de mappage (ex-animalMapper) est importée depuis useAnimal.js.
 */

import { useEffect, useState } from 'react'
import { getAnimaux } from '../services/publicApi'
import { mapAnimals } from './useAnimal'
import { normalizeApiError } from '../lib/http'

export const useFilters = () => {
  const [animauxData, setAnimauxData] = useState([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [espece,      setEspece]      = useState('Tous')
  const [race,        setRace]        = useState('Tous')
  const [taille,      setTaille]      = useState([])
  const [caractere,   setCaractere]   = useState([])
  const [selectedTraits, setSelectedTraits] = useState([])
  const [search,      setSearch]      = useState('')

  const toggleTaille    = (t) => setTaille(prev    => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const toggleCaractere = (c) => setCaractere(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleTrait     = (t) => setSelectedTraits(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const reset = () => {
    setEspece('Tous')
    setRace('Tous')
    setTaille([])
    setCaractere([])
    setSelectedTraits([])
    setSearch('')
  }

  useEffect(() => {
    const loadAnimaux = async () => {
      try {
        const data   = await getAnimaux()
        const mapped = Array.isArray(data) ? mapAnimals(data) : []
        setAnimauxData(mapped)
      } catch (error) {
        console.error('Erreur lors du chargement des animaux:', error)
        setAnimauxData([])
      } finally {
        setIsLoading(false)
      }
    }
    loadAnimaux()
  }, [])

  const filteredAnimaux = animauxData.filter(a => {
    if (espece !== 'Tous' && a.espece !== espece) return false
    if (race   !== 'Tous' && a.race   !== race)   return false
    if (taille.length > 0 && !taille.includes(a.taille)) return false
    if (caractere.length > 0 && !caractere.some(c => a.caractere.includes(c))) return false
    if (selectedTraits.length > 0 && !selectedTraits.every(t => a.traits?.includes(t))) return false
    if (search && !a.nom.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const availableRaces = ['Tous', ...new Set(animauxData
    .filter(a => espece === 'Tous' || a.espece === espece)
    .map(a => a.race))]

  return {
    espece, setEspece,
    race, setRace,
    availableRaces,
    taille, toggleTaille,
    caractere, toggleCaractere,
    selectedTraits, toggleTrait,
    search, setSearch,
    reset, filteredAnimaux,
    isLoading,
  }
}
