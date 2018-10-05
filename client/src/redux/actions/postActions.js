import axios from 'axios';
import {ADD_POST, GET_ERRORS, GET_POSTS, DELETE_POST, POSTS_LOADING} from './types';

// Add a post
export const addPostAction = postData => dispatch => {
    axios
        .post('/api/posts', postData)
        .then(res => dispatch ({
            type: ADD_POST,
            payload: res.data}))
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
};

// Get Posts
export const getPostsAction = () => dispatch => {

    dispatch(setPostsLoading());

    axios
        .get('/api/posts')
        .then(res => dispatch ({
            type: GET_POSTS,
            payload: res.data}))
        .catch(err => dispatch({
            type: GET_POSTS,
            payload: null
        }))
};

// Delete a post
export const deletePostAction = id => dispatch => {
    axios
        .delete(`/api/posts/${id}`)
        .then(res => dispatch ({
            type: DELETE_POST,
            payload: id}))
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }))
};


// Profile loading
export const setPostsLoading = () => {
    return {
        type: POSTS_LOADING
    }
};