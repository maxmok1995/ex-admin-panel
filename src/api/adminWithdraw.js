import axios from "axios";

export const adminSetWithdrawStatus = (id, withdrawState, withdrawExp) => {
    const params = new URLSearchParams();
    if (withdrawState === "accept") {
        params.append("fee", "0");
        params.append("destTransactionRef", withdrawExp);
    } else {
        params.append("reason", withdrawExp);
    }
    return axios.post(`/wallet/admin/withdraw/${id}/${withdrawState}`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
};
