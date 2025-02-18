const extractFirstName = (responseData: CreateUserRequest) => {
    let first_name = '';
    let last_name = '';

    // Check for the 'given_name' and 'family_name' fields
    if (responseData.given_name && typeof responseData.given_name === 'string') {
        first_name = responseData.given_name;
    } else if (responseData.name && typeof responseData.name === 'string') {
        const nameParts = responseData.name.trim().split(' ');
        first_name = nameParts.length > 0 ? nameParts[0] : '';
    }

    if (responseData.family_name && typeof responseData.family_name === 'string') {
        last_name = responseData.family_name;
    } else if (responseData.name && typeof responseData.name === 'string') {
        const nameParts = responseData.name.trim().split(' ');
        last_name = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    }

    return { first_name, last_name };
}

const randomString = async (strLength: number) => {
	var result = '';
	var charSet = '';

	strLength = strLength || 5;
	charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	while (strLength--) { // (note, fixed typo)
		result += charSet.charAt(Math.floor(Math.random() * charSet.length));
	}

	return result;
}

const extractYouTubeLink = async (message: string) => {
    // Regular expression to match YouTube video links
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    
    // Execute regex search
    const match = message.match(youtubeRegex);

    // If a match is found, return the full link, else return null
    return match ? match[0] : "";
}

export const commonFunctions = {
    extractFirstName,
    randomString,
    extractYouTubeLink
}