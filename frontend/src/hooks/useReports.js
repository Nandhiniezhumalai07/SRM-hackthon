/**
 * useReports.js
 * Custom hook for fetching and caching hazard reports.
 */
import { useState, useEffect } from 'react';
import { getAllReports } from '../api';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();
      setReports(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load reports. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  return { reports, loading, error, refetch: fetchReports };
}
