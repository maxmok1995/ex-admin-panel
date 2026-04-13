import axios from "axios";

export const adminManualDeposit = (uuid, symbol, amount, description, ref) => {
    const url = "/wallet/v1/deposit/manually/" + amount + "_" + symbol + "/" + uuid;
    return axios.post(url, {
        description: description || "Admin manual deposit",
        ref: ref || undefined
    });
};

export const adminUploadAddressPool = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.put("/admin/address", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};
