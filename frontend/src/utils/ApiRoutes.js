export const HOST = "http://localhost:3002";

const AUTH_ROUTE = `${HOST}/api/auth`;
const MESSAGES_ROUTES = `${HOST}/api/messages`;

export const CHECK_USER_ROUTE = `${AUTH_ROUTE}/check-user`;
export const ONBOARD_USER_ROUTE = `${AUTH_ROUTE}/onboard-user`;
export const GET_ALL_CONTACTS = `${AUTH_ROUTE}/get-contacts`;
export const GET_CALL_TOKEN = `${AUTH_ROUTE}/generate-token`;
export const ADD_MESSAGE_ROUTES = `${MESSAGES_ROUTES}/add-message`;
export const GET_MESSAGES_ROUTES = `${MESSAGES_ROUTES}/get-messages`;
export const ADD_IMAGE_ROUTES = `${MESSAGES_ROUTES}/add-image-message`;
export const ADD_AUDIO_ROUTES = `${MESSAGES_ROUTES}/add-audio-message`;
export const GET_INITIAL_CONTACTS_ROUTES = `${MESSAGES_ROUTES}/get-initial-contact`;
