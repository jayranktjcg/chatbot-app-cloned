// Created By Israil Gulzar

// ** Service Imports
import apiCall from '../../Helper/Service';

// ** Helper Imports
import AppUtils from '../../Helper/AppUtils';

export const loginUser = async (payload) => {
    const res = await apiCall({
        url: 'users/create',
        data: payload,
        method: 'post',
        isLogin: true,
        isHideToast: false,
    });

    if (res?.status === 200) {
        console.log('Resp -->',res)
        AppUtils.setLocalStorage('CHATBOT', AppUtils.encodeStr(JSON.stringify({...res?.data?.user, token: res?.data?.token})));
    }

    return res;
};
