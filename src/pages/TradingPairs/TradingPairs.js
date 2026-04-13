import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getPairs, addPair, removePair } from "../../api/tradingPairs";

const defaultForm = {
    leftSide: "",
    rightSide: "",
    alias: "",
    makerFee: "0.01",
    takerFee: "0.01",
    engine: "matching-engine"
};

const TradingPairs = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: pairs = [], isLoading } = useQuery(
        ["tradingPairs"],
        async () => {
            const { data } = await getPairs();
            return data;
        },
        { retry: 1 }
    );

    const addMutation = useMutation(
        (formData) => addPair(formData),
        {
            onSuccess: () => {
                toast.success("Trading pair added. Services restarting (~15s)...");
                queryClient.invalidateQueries(["tradingPairs"]);
                setShowModal(false);
                setForm(defaultForm);
            },
            onError: (e) => toast.error(e.response?.data?.error || "Failed to add pair")
        }
    );

    const deleteMutation = useMutation(
        (pair) => removePair(pair),
        {
            onSuccess: () => {
                toast.success("Trading pair removed. Services restarting...");
                queryClient.invalidateQueries(["tradingPairs"]);
                setDeleteConfirm(null);
            },
            onError: (e) => toast.error(e.response?.data?.error || "Failed to remove pair")
        }
    );

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "leftSide" || name === "rightSide") {
                const l = (name === "leftSide" ? value : prev.leftSide).toUpperCase();
                const r = (name === "rightSide" ? value : prev.rightSide).toUpperCase();
                if (l && r) updated.alias = l + r;
            }
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addMutation.mutate(form);
    };

    return (
        <div className="container p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-color">Trading Pairs</h4>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                    style={{ background: "#3772ff", border: "none", borderRadius: 8, padding: "8px 20px" }}
                >
                    + Add Pair
                </button>
            </div>

            {isLoading ? (
                <p className="text-color">Loading...</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table className="text-center striped" cellSpacing="0" cellPadding="0" style={{ width: "100%" }}>
                        <thead>
                        <tr>
                            <th className="text-color p-2">Pair</th>
                            <th className="text-color p-2">Base</th>
                            <th className="text-color p-2">Quote</th>
                            <th className="text-color p-2">Alias</th>
                            <th className="text-color p-2">Maker Fee</th>
                            <th className="text-color p-2">Taker Fee</th>
                            <th className="text-color p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pairs.map((p) => (
                            <tr key={p.pair}>
                                <td className="p-2">{p.pair}</td>
                                <td className="p-2">{p.leftSide}</td>
                                <td className="p-2">{p.rightSide}</td>
                                <td className="p-2">{p.alias}</td>
                                <td className="p-2">{p.makerFee ? (parseFloat(p.makerFee) * 100).toFixed(1) + "%" : "-"}</td>
                                <td className="p-2">{p.takerFee ? (parseFloat(p.takerFee) * 100).toFixed(1) + "%" : "-"}</td>
                                <td className="p-2">
                                    {deleteConfirm === p.pair ? (
                                        <span>
                                            <span className="text-danger me-2">Confirm?</span>
                                            <button
                                                className="btn btn-sm btn-danger me-1"
                                                onClick={() => deleteMutation.mutate(p.pair)}
                                                disabled={deleteMutation.isLoading}
                                                style={{ fontSize: 12, padding: "2px 8px" }}
                                            >Yes</button>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => setDeleteConfirm(null)}
                                                style={{ fontSize: 12, padding: "2px 8px" }}
                                            >No</button>
                                        </span>
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => setDeleteConfirm(p.pair)}
                                            style={{ fontSize: 12, padding: "2px 8px", background: "#e53935", border: "none", borderRadius: 4, color: "#fff" }}
                                        >Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{ background: "var(--card-bg, #1a1d2e)", borderRadius: 12, padding: 32, width: 420, color: "var(--text-color, #fff)" }}>
                        <h5 className="mb-4">Add Trading Pair</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Base Currency (e.g. XRP)</label>
                                <input name="leftSide" value={form.leftSide} onChange={handleFormChange} required
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "inherit" }}
                                    placeholder="XRP" />
                            </div>
                            <div className="mb-3">
                                <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Quote Currency (e.g. USDT)</label>
                                <input name="rightSide" value={form.rightSide} onChange={handleFormChange} required
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "inherit" }}
                                    placeholder="USDT" />
                            </div>
                            <div className="mb-3">
                                <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Alias (display name)</label>
                                <input name="alias" value={form.alias} onChange={handleFormChange} required
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "inherit" }}
                                    placeholder="XRPUSDT" />
                            </div>
                            <div style={{ display: "flex", gap: 12 }} className="mb-3">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Maker Fee</label>
                                    <input name="makerFee" type="number" step="0.001" value={form.makerFee} onChange={handleFormChange}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "inherit" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Taker Fee</label>
                                    <input name="takerFee" type="number" step="0.001" value={form.takerFee} onChange={handleFormChange}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "inherit" }} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Matching Engine</label>
                                <select name="engine" value={form.engine} onChange={handleFormChange}
                                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #444", background: "var(--card-bg, #1a1d2e)", color: "inherit" }}>
                                    <option value="matching-engine">matching-engine (main)</option>
                                    <option value="matching-engine-duo">matching-engine-duo</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button type="button" onClick={() => { setShowModal(false); setForm(defaultForm); }}
                                    style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #666", background: "transparent", color: "inherit", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={addMutation.isLoading}
                                    style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#3772ff", color: "#fff", cursor: "pointer" }}>
                                    {addMutation.isLoading ? "Adding..." : "Add Pair"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradingPairs;
