import React, {useState} from "react";
import {adminUploadAddressPool} from "../../api/adminDeposit";
import ScrollBar from "../../components/ScrollBar";
import Loading from "../../components/Loading";

const DepositAddress = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) { setError("Please select a CSV file"); return; }
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await adminUploadAddressPool(file);
            setSuccess("Address pool uploaded successfully!");
            setFile(null);
            e.target.reset();
        } catch (err) {
            setError(err?.response?.data?.message || err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollBar>
            <div className="col-12 px-5 py-5">
                <div className="col-12 col-lg-8 mx-auto">
                    <div className="userInfoBox mb-5">
                        <h4 className="py-3 primary-bg rounded d-flex justify-content-center align-items-center">
                            Deposit Address Pool
                        </h4>
                        <div className="p-4">
                            <div className="alert alert-info mb-4" style={{fontSize:"0.9rem"}}>
                                <strong>CSV Format:</strong> Each row must have 3 columns:<br/>
                                <code>address, regex_pattern, address_type</code><br/>
                                <small className="text-muted">Example: <code>0xABCDEF..., ^0x[0-9a-fA-F]{40}$, EVM</code></small>
                            </div>
                            <form onSubmit={handleUpload}>
                                <div className="mb-4">
                                    <label className="form-label">Select CSV File</label>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="form-control secondary-bg"
                                        style={{border:"1px solid #444"}}
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                    {file && <small className="text-muted mt-1 d-block">Selected: {file.name} ({(file.size/1024).toFixed(1)} KB)</small>}
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                                <button type="submit" className="btn btn-success px-4" disabled={loading || !file}>
                                    {loading ? <Loading /> : "Upload Address Pool"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="userInfoBox">
                        <h4 className="py-3 primary-bg rounded d-flex justify-content-center align-items-center">
                            How It Works
                        </h4>
                        <div className="p-4">
                            <ol style={{lineHeight:"2"}}>
                                <li>Upload a CSV of deposit addresses into the pool (this page)</li>
                                <li>Users request a deposit address from the exchange UI</li>
                                <li>System auto-assigns one address per user per currency</li>
                                <li>Monitor assigned addresses on the blockchain</li>
                                <li>When a deposit is confirmed, go to <strong>Wallet</strong> and click <strong>+ Deposit</strong> to credit the user</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollBar>
    );
};

export default DepositAddress;
