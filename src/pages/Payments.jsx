import React, { useState, useEffect } from 'react';
import {
  CreditCard, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2,
  XCircle, Smartphone, ChevronDown, RefreshCw, Loader2, Plus, Save
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Payments.css';

const BASE = 'https://pakacha.com/api/v1';

const fmt = (n) => `UGX ${Number(n || 0).toLocaleString('en-UG', { minimumFractionDigits: 0 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completed', icon: CheckCircle2, cls: 'status-completed' },
  PENDING:   { label: 'Pending',   icon: Clock,         cls: 'status-pending' },
  FAILED:    { label: 'Failed',    icon: XCircle,       cls: 'status-failed' },
  CANCELLED: { label: 'Cancelled', icon: XCircle,       cls: 'status-cancelled' },
};

const Payments = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [summary, setSummary]         = useState(null);
  const [transactions, setTx]         = useState([]);
  const [disbursements, setDis]       = useState([]);
  const [payoutAccount, setAccount]   = useState(null);
  const [tab, setTab]                 = useState('transactions');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  // Payout form
  const [phone, setPhone]       = useState('');
  const [provider, setProvider] = useState('MTN');
  const [accName, setAccName]   = useState('');
  const [editPayout, setEditPayout] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, txRes, disRes, accRes] = await Promise.all([
        axios.get(`${BASE}/payments/summary`, { headers }),
        axios.get(`${BASE}/payments/transactions`, { headers }),
        axios.get(`${BASE}/payments/disbursements`, { headers }),
        axios.get(`${BASE}/payments/payout-account`, { headers }),
      ]);
      setSummary(sumRes.data);
      setTx(txRes.data || []);
      setDis(disRes.data || []);
      if (accRes.data) {
        setAccount(accRes.data);
        setPhone(accRes.data.phone_number);
        setProvider(accRes.data.provider);
        setAccName(accRes.data.account_name);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handlePayoutSent = () => {
      console.log("Real-time payout disbursement event received. Reloading business payments data...");
      load();
    };
    window.addEventListener('poch-biz-payout-sent', handlePayoutSent);
    return () => {
      window.removeEventListener('poch-biz-payout-sent', handlePayoutSent);
    };
  }, []);

  const savePayoutAccount = async (e) => {
    e.preventDefault();
    if (!phone || !accName) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill in all payout account details.', background: '#fff', color: '#0b182a' });
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${BASE}/payments/payout-account`, { phone_number: phone, provider, account_name: accName }, { headers });
      await load();
      setEditPayout(false);
      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Your payout account has been updated.', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not save payout account. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const providerColors = { MTN: '#ffcc00', AIRTEL: '#ff0000', MPESA: '#4caf50' };

  return (
    <div className="payments-page animate-fade">
      {/* Header */}
      <div className="pay-header">
        <div>
          <h1>Payments & Payouts</h1>
          <p>Track your earnings, payment transactions, and disbursement history.</p>
        </div>
        <button className="btn-refresh" onClick={load} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="pay-summary-grid">
          <div className="pay-card pay-card-total">
            <div className="pay-card-icon"><ArrowDownCircle size={22} /></div>
            <div className="pay-card-info">
              <span className="pay-card-label">Total Collected</span>
              <span className="pay-card-value">{fmt(summary.total_collected)}</span>
            </div>
          </div>
          <div className="pay-card pay-card-earnings">
            <div className="pay-card-icon"><CreditCard size={22} /></div>
            <div className="pay-card-info">
              <span className="pay-card-label">Your Earnings (after 5% fee)</span>
              <span className="pay-card-value">{fmt(summary.total_earnings)}</span>
            </div>
          </div>
          <div className="pay-card pay-card-pending">
            <div className="pay-card-icon"><Clock size={22} /></div>
            <div className="pay-card-info">
              <span className="pay-card-label">Pending Payout</span>
              <span className="pay-card-value">{fmt(summary.pending_payout)}</span>
            </div>
          </div>
          <div className="pay-card pay-card-disbursed">
            <div className="pay-card-icon"><ArrowUpCircle size={22} /></div>
            <div className="pay-card-info">
              <span className="pay-card-label">Total Disbursed to You</span>
              <span className="pay-card-value">{fmt(summary.total_disbursed)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payout Account Setup */}
      <div className="payout-account-card glass">
        <div className="payout-account-header">
          <div className="payout-header-left">
            <Smartphone size={20} />
            <div>
              <h3>Mobile Money Payout Account</h3>
              <p>This is where admin will send your earnings via YO! Payments.</p>
            </div>
          </div>
          <button className="btn-edit-payout" onClick={() => setEditPayout(!editPayout)}>
            {editPayout ? 'Cancel' : payoutAccount ? 'Edit Account' : <><Plus size={14} /> Set Up Account</>}
          </button>
        </div>

        {!editPayout && payoutAccount ? (
          <div className="payout-account-display">
            <div className="payout-detail-row">
              <span className="payout-detail-label">Account Name</span>
              <span className="payout-detail-value">{payoutAccount.account_name}</span>
            </div>
            <div className="payout-detail-row">
              <span className="payout-detail-label">Phone Number</span>
              <span className="payout-detail-value">{payoutAccount.phone_number}</span>
            </div>
            <div className="payout-detail-row">
              <span className="payout-detail-label">Provider</span>
              <span className="provider-badge" style={{ background: providerColors[payoutAccount.provider] + '22', color: providerColors[payoutAccount.provider], border: `1px solid ${providerColors[payoutAccount.provider]}44` }}>
                {payoutAccount.provider}
              </span>
            </div>
          </div>
        ) : !editPayout && !payoutAccount ? (
          <div className="payout-empty">
            <Smartphone size={36} opacity={0.3} />
            <p>No payout account configured. Click "Set Up Account" to add your mobile money number.</p>
          </div>
        ) : null}

        {editPayout && (
          <form className="payout-form" onSubmit={savePayoutAccount}>
            <div className="payout-form-grid">
              <div className="form-group">
                <label>Account Name</label>
                <input type="text" placeholder="e.g. John Mukasa" value={accName} onChange={e => setAccName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="text" placeholder="e.g. 256701234567" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Mobile Provider</label>
                <div className="provider-selector">
                  {['MTN', 'AIRTEL', 'MPESA'].map(p => (
                    <button key={p} type="button"
                      className={`provider-btn ${provider === p ? 'active' : ''}`}
                      style={provider === p ? { background: providerColors[p] + '22', borderColor: providerColors[p], color: providerColors[p] } : {}}
                      onClick={() => setProvider(p)}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-save-payout" type="submit" disabled={saving}>
              {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Payout Account</>}
            </button>
          </form>
        )}
      </div>

      {/* Tab Bar */}
      <div className="pay-tabs">
        <button className={`pay-tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>
          Payment Transactions ({transactions.length})
        </button>
        <button className={`pay-tab ${tab === 'disbursements' ? 'active' : ''}`} onClick={() => setTab('disbursements')}>
          Disbursements Received ({disbursements.length})
        </button>
      </div>

      {/* Transactions Table */}
      {tab === 'transactions' && (
        loading ? (
          <div className="pay-loading"><Loader2 size={24} className="spin" /> Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="pay-empty glass">
            <CreditCard size={40} opacity={0.3} />
            <h3>No Transactions Yet</h3>
            <p>Payment transactions will appear here when customers pay for orders.</p>
          </div>
        ) : (
          <div className="pay-table-wrapper glass">
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>YO! Ref</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={tx.id}>
                      <td className="ref-cell"><code>{tx.internal_reference}</code></td>
                      <td>{tx.phone_number}</td>
                      <td className="amount-cell">{fmt(tx.amount)}</td>
                      <td><span className={`status-tag ${cfg.cls}`}><Icon size={12} /> {cfg.label}</span></td>
                      <td className="ref-cell">{tx.yo_transaction_id ? <code>{tx.yo_transaction_id}</code> : <span className="na">—</span>}</td>
                      <td>{fmtDate(tx.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Disbursements Table */}
      {tab === 'disbursements' && (
        loading ? (
          <div className="pay-loading"><Loader2 size={24} className="spin" /> Loading disbursements...</div>
        ) : disbursements.length === 0 ? (
          <div className="pay-empty glass">
            <ArrowUpCircle size={40} opacity={0.3} />
            <h3>No Disbursements Yet</h3>
            <p>When the admin disburses your earnings via mobile money, they will appear here.</p>
          </div>
        ) : (
          <div className="pay-table-wrapper glass">
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Gross Amount</th>
                  <th>Platform Fee (5%)</th>
                  <th>Net Paid To You</th>
                  <th>Phone</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {disbursements.map(d => {
                  const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={d.id}>
                      <td className="ref-cell"><code>{d.internal_reference}</code></td>
                      <td>{fmt(d.gross_amount)}</td>
                      <td className="fee-cell">-{fmt(d.platform_fee)}</td>
                      <td className="net-cell">{fmt(d.net_amount)}</td>
                      <td>{d.phone_number}</td>
                      <td><span className="provider-badge-sm">{d.provider}</span></td>
                      <td><span className={`status-tag ${cfg.cls}`}><Icon size={12} /> {cfg.label}</span></td>
                      <td>{fmtDate(d.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default Payments;
