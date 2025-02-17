import axios from "axios/index";
import { logOut } from "../actions/userCreators";

export const callApi = (method, url, data, config) => {
    let headers = null
    let bearer = null
    if (window.localStorage.getItem('iTripper_access_token')){
        const refreshTokenExpires = Date.parse(localStorage.getItem('iTripper_refresh_token_expires'))
        const accessTokenExpires = Date.parse(localStorage.getItem('iTripper_access_token_expires'))
        if (refreshTokenExpires && (Date.now() > refreshTokenExpires)){
            logOut();
        } else if (Date.now() >= accessTokenExpires){
            const userTokenRefresh = window.localStorage.getItem('iTripper_refresh_token');
            axios({
                method: 'post',
                url: 'api/usertokens',
                data: { userTokenRefresh }
            })
                .then(response => {
                    if (response.data) {
                        setLocalStorage(response.data.userTokenAccess, response.data.userTokenRefresh)
                        bearer = response.data.userTokenAccess
                    } else {
                        logOut()
                    }
                })
        }
        bearer = window.localStorage.getItem('iTripper_access_token')
        headers = Object.assign({ Authorization: `Bearer ${bearer}` }, config)
    }
    return axiosRequest(method, url, data, headers, config)
}
//* *********************

export const axiosRequest = (method, url, data, headers, config) => {
    return axios({
        method,
        url,
        data,
        headers,
        cancelToken: config,
    })
}
//* *********************

export const setLocalStorage = (accessToken, refreshToken) => {
    const accessTokenExpires = new Date(Date.now() + 880000).toISOString()
    const refreshTokenExpires = new Date(Date.now() + 2591900000).toISOString()
    localStorage.setItem('iTripper_access_token', accessToken)
    localStorage.setItem('iTripper_refresh_token', refreshToken)
    localStorage.setItem('iTripper_access_token_expires', accessTokenExpires)
    localStorage.setItem('iTripper_refresh_token_expires', refreshTokenExpires)
}

//* *********************
export const removeTokens = () => {
    localStorage.removeItem('iTripper_access_token')
    localStorage.removeItem('iTripper_access_token_expires')
    localStorage.removeItem('iTripper_refresh_token')
    localStorage.removeItem('iTripper_refresh_token_expires')
    localStorage.removeItem('iTripper_page')
    localStorage.removeItem('tripId')
    localStorage.removeItem('firebaseui::rememberedAccounts')
}

//* *********************
const memo = Object.create(null);

const search = () => {
    let source;
    return (method, url, data) => {
        if(source){
            source.cancel('canceled by user')
        }
        source = axios.CancelToken.source();
        try{
            if (memo[data.pointSearchText]){
                return memo[data.pointSearchText]
            }
            const response = callApi(method, url, data, source.token)
            response
                .then(res => memo[data.pointSearchText] = res)
                .catch(console.log)
            return response
        } catch(error) {
            if(axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                console.log("Something's gone wrong: ", error.message)
            }
        }
    }
}

export const singleCallApi = search()

