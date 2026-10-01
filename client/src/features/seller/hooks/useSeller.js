import { useState, useEffect, useCallback } from 'react';
import { sellerApi } from '../api/seller.api.js';
import { useAuthContext } from '../../auth/context/AuthContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';

export const useSeller = () => {
  const { isSeller, refreshSession } = useAuthContext();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSellerData = useCallback(async () => {
    if (!isSeller) return;
    try {
      setLoading(true);
      const [profRes, listRes, salesRes] = await Promise.all([
        sellerApi.getProfile(),
        sellerApi.getListings(),
        sellerApi.getSales()
      ]);

      if (profRes.success) setProfile(profRes.data.profile);
      if (listRes.success) setListings(listRes.data.listings || []);
      if (salesRes.success) setSales(salesRes.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isSeller]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  const onboard = async (payload) => {
    try {
      setSubmitting(true);
      const res = await sellerApi.onboard(payload);
      addToast('Seller profile created successfully!', 'success');
      await refreshSession();
      await fetchSellerData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const createListing = async (payload) => {
    try {
      setSubmitting(true);
      const res = await sellerApi.createListing(payload);
      addToast('Listing published successfully!', 'success');
      await fetchSellerData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updateListing = async (id, payload) => {
    try {
      setSubmitting(true);
      const res = await sellerApi.updateListing(id, payload);
      addToast('Listing updated', 'info');
      await fetchSellerData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteListing = async (id) => {
    try {
      setSubmitting(true);
      await sellerApi.deleteListing(id);
      addToast('Listing deactivated', 'info');
      await fetchSellerData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    profile,
    listings,
    sales,
    loading,
    submitting,
    onboard,
    createListing,
    updateListing,
    deleteListing,
    refreshSeller: fetchSellerData
  };
};
