// src/hooks/useDisponibilite.js
// Hook pour les disponibilités prestataire
// Pattern local : useState + useEffect + useCallback (sans @tanstack/react-query)

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getDisponibilitesByProfil,
  createDisponibilite,
  updateDisponibilite,
  deleteDisponibilite,
} from "../services/authApi";

// ─────────────────────────────────────────
// Lecture : disponibilités d'un prestataire
// ─────────────────────────────────────────
export const useDisponibilites = (profilId) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [DisponibilitesLoading, setDisponibilitesLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchDisponibilites = useCallback(async () => {
    if (!profilId) return;
    setDisponibilitesLoading(true);
    setIsError(false);
    try {
      const data = await getDisponibilitesByProfil(profilId);
      setDisponibilites(Array.isArray(data) ? data : []);
    } catch (err) {
      setIsError(true);
      setError(err);
      setDisponibilites([]);
    } finally {
      setDisponibilitesLoading(false);
    }
  }, [profilId]);

  useEffect(() => {
    fetchDisponibilites();
  }, [fetchDisponibilites]);

  // Map indexée par Id pour accès O(1)
  const disponibiliteMap = useMemo(
    () => new Map(disponibilites.map((e) => [e.Id, e])),
    [disponibilites]
  );

  return {
    disponibilites,
    disponibiliteMap,
    DisponibilitesLoading,
    isError,
    error,
    refetch: fetchDisponibilites,
  };
};

// ─────────────────────────────────────────
// Création d'une disponibilité
// ─────────────────────────────────────────
export const useCreateDisponibilite = (onSuccess) => {
  const [isPending, setIsPending] = useState(false);
  const [createError, setCreateError] = useState(null);

  const mutate = useCallback(async (disponibiliteData) => {
    setIsPending(true);
    setCreateError(null);
    try {
      const result = await createDisponibilite(disponibiliteData);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setCreateError(err);
      console.error("Erreur lors de la création de la disponibilité:", err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [onSuccess]);

  return { mutate, isPending, error: createError };
};

// ─────────────────────────────────────────
// Mise à jour d'une disponibilité
// ─────────────────────────────────────────
export const useUpdateDisponibilite = (onSuccess) => {
  const [isPending, setIsPending] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const mutate = useCallback(async ({ id, data }) => {
    setIsPending(true);
    setUpdateError(null);
    try {
      const result = await updateDisponibilite(id, data);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setUpdateError(err);
      console.error(`Erreur lors de la mise à jour de la disponibilité ${id}:`, err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [onSuccess]);

  return { mutate, isPending, error: updateError };
};

// ─────────────────────────────────────────
// Suppression d'une disponibilité
// ─────────────────────────────────────────
export const useDeleteDisponibilite = (onSuccess) => {
  const [isPending, setIsPending] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const mutate = useCallback(async (id) => {
    setIsPending(true);
    setDeleteError(null);
    try {
      const result = await deleteDisponibilite(id);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setDeleteError(err);
      console.error("Erreur lors de la suppression de la disponibilité:", err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [onSuccess]);

  return { mutate, isPending, error: deleteError };
};
