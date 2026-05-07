import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import './Payments.css';

const Payments = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedSummary = localStorage.getItem('cache_payments_summary');
    const cachedTrans = localStorage.getItem('cache_payments_trans');
    if (cachedSummary && cachedTrans) {
      setSummary(JSON.parse(cachedSummary));
      setTransactions(JSON.parse(cachedTrans));
      setLoading(false);
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [sumRes, transRes] = await Promise.all([
          axios.get('http://146.190.202.220/api/v1/payments/summary', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://146.190.202.220/api/v1/payments/transactions', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setSummary(sumRes.data);
        setTransactions(transRes.data);
        localStorage.setItem('cache_payments_summary', JSON.stringify(sumRes.data));
        localStorage.setItem('cache_payments_trans', JSON.stringify(transRes.data));
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="payments-loading">Loading financial data...</div>;

  return (
    <div className="payments-page animate-fade">
      <div className="payments-header">
        <h1>Payments & Payouts</h1>
        <p>Track your earnings, pending balances, and payout history.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon primary"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Total Revenue</span>
            <h2 className="val">{summary?.total_revenue.toLocaleString()} {summary?.currency}</h2>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon emerald"><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Available Balance</span>
            <h2 className="val">{summary?.available_balance.toLocaleString()} {summary?.currency}</h2>
          </div>
          <button className="payout-btn" style={{marginLeft: 'auto'}}>Withdraw</button>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon amber"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Pending Payout</span>
            <h2 className="val">{summary?.pending_payout.toLocaleString()} {summary?.currency}</h2>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <button className="view-all-btn">Export CSV</button>
        </div>

        <div className="transactions-card">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Gross Amount</th>
                <th>Net (95%)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className="tx-id">{tx.description}</span>
                  </td>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>{tx.amount.toLocaleString()} {summary?.currency}</td>
                  <td className="net-amount">{(tx.amount * 0.95).toLocaleString()} {summary?.currency}</td>
                  <td>
                    <span className={`status-pill ${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon"><ArrowUpRight size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
