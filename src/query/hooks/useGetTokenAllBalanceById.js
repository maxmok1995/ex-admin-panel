import {useQuery} from "@tanstack/react-query";
import axios from "axios";

export const useGetTokenAllBalanceById = (chainId, params) => {
    return useQuery(
        ['token-balance', chainId], async () => {
            /*if (chainId === null) return;*/
            const {data} = await axios.get(`(window.env.REACT_APP_WALLETSTAT_URL||"")/v1/balance/token/${chainId}`, {
                params: params
            })
            return data;
        },
        {
            retry: 1,
            /*enabled: false,
            initialData:[]*/
        });
}