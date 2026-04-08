// Updated to support multiple owner IDs
const OWNER_IDS = ["1051444466235486298", "282997545620209665"];

function checkAuth(userId) {
    return OWNER_IDS.includes(userId);
}

function authCmd(command) {
    if (checkAuth(command.userId)) {
        // Execute command for owner
    } else {
        // Handle non-owner
    }
}