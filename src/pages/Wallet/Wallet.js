import React, {useState} from "react";
import {useGetWalletData} from "../../query";
import Loading from "../../components/Loading";
import ScrollBar from "../../components/ScrollBar";
import {BN} from "../../utils/utils";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import {adminManualDeposit} from "../../api/adminDeposit";

const DepositModal = ({wallet, onClose, onSuccess}) => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [txRef, setTxRef] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await adminManualDeposit(wallet.uuid, wallet.currency, amount, description, txRef || undefined);
            setSuccess(true);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } catch (err) {
            setError(err?.response?.data?.message || err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div className="secondary-bg rounded p-4" style={{width:"480px",maxWidth:"95vw"}}>
                <h5 className="mb-4">Manual Deposit</h5>
                <div className="mb-2"><small className="text-muted">User: {wallet.title}</small></div>
                <div className="mb-3"><small className="text-muted">Currency: <strong>{wallet.currency}</strong> | Type: {wallet.walletType}</small></div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Amount *</label>
                        <input type="number" step="any" min="0" className="form-control secondary-bg" style={{border:"1px solid #444"}}
                            value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100.5" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Transaction Ref</label>
                        <input type="text" className="form-control secondary-bg" style={{border:"1px solid #444"}}
                            value={txRef} onChange={e => setTxRef(e.target.value)} placeholder="Blockchain tx hash (optional)" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <input type="text" className="form-control secondary-bg" style={{border:"1px solid #444"}}
                            value={description} onChange={e => setDescription(e.target.value)} placeholder="Note (optional)" />
                    </div>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    {success && <div className="alert alert-success py-2">Deposit successful!</div>}
                    <div className="d-flex gap-2 justify-content-end mt-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-success px-4" disabled={loading}>
                            {loading ? <Loading /> : "Deposit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Wallet = () => {
    const [params, setParams] = useState({excludeSystem: true, limit: 500, offset: 0});
    const {data, isLoading, error, refetch} = useGetWalletData(params);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [search, setSearch] = useState("");

    const filtered = data?.filter(w =>
        !search || w.title?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    return (
        <ScrollBar>
            {selectedWallet && (
                <DepositModal wallet={selectedWallet} onClose={() => setSelectedWallet(null)} onSuccess={() => { refetch(); }} />
            )}
            <div className="d-flex flex-row col-5 col-12 align-items-center px-5 my-5">
                <span>Exclude System Wallets</span>
                <span className="mx-2"> </span>
                <ToggleSwitch onchange={() => setParams(prev => ({...prev, excludeSystem: !prev.excludeSystem}))} checked={params?.excludeSystem}/>
            </div>
            <div className="px-5 mb-3">
                <input
                    type="text"
                    className="form-control secondary-bg"
                    style={{border:"1px solid #444", maxWidth:"400px"}}
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="col-12 d-flex flex-column justify-content-between align-items-center px-5">
                <table className="table table-bordered rounded text-center col-12 striped table-responsive">
                    <thead className="py-2 my-2">
                    <tr>
                        <th scope="col" style={{width:"4%"}}/>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Wallet Type</th>
                        <th scope="col">Balance</th>
                        <th scope="col">Currency</th>
                        <th scope="col">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan="7" className="text-center py-5" style={{height:"50vh"}}><Loading/></td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan="7" className="text-center" style={{height:"50vh"}}>{search ? "No results found" : "No User Exist"}</td></tr>
                    ) : filtered.map((wallet, index) => (
                        <tr key={index}>
                            <th scope="row">{index + 1}</th>
                            <td>{wallet?.title?.slice(wallet?.title.indexOf("-") + 1)}</td>
                            <td>{wallet?.title?.slice(0, wallet?.title.indexOf("-"))}</td>
                            <td>{wallet?.walletType}</td>
                            <td>{new BN(wallet?.balance).toFormat()}</td>
                            <td>{wallet?.currency}</td>
                            <td>
                                {wallet?.walletType === "MAIN" && (
                                    <button className="btn btn-sm btn-success" onClick={() => setSelectedWallet(wallet)}>+ Deposit</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {error && <div className="alert alert-danger" role="alert">{error.toString()}</div>}
            </div>
        </ScrollBar>
    );
};

export default Wallet;
