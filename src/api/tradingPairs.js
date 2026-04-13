import axios from "axios";

export const getPairs = () =>
    axios.get('/admin/trading/v1/pairs');

export const addPair = (data) =>
    axios.post('/admin/trading/v1/pair', data);

export const removePair = (pair) =>
    axios.delete(`/admin/trading/v1/pair/${pair}`);
