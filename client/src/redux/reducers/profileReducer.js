import {
    GET_PROFILE,
    PROFILE_LOADING,
    CLEAR_CURRENT_PROFILE,
    GET_PROFILES} from "../actions/types";

// Create the initial state
const initialProfileState = {
    profile: null,
    profiles: null,
    loading: false
};

export default function (state = initialProfileState, action) {
    switch (action.type) {
        case PROFILE_LOADING:
            return {
                ...state,
                loading: true
            };
        case GET_PROFILES:
            return {
                ...state,
                profiles: action.payload,
                loading: false
            };
        case GET_PROFILE:
            return {
                ...state,
                profile: action.payload,
                loading: false
            };
        case CLEAR_CURRENT_PROFILE:
            return {
                ...state,
                profile: null
            };
        default: return state;
    }
}