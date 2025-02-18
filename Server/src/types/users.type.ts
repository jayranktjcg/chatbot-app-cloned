interface GoogleAuthResponse {
    id: number;
    google_id: string;
    email: string;
    name: string;
    given_name?: string;
    family_name?: string;
    profile_picture?: string;
    created_at: Date;
    updated_at: Date;
}

interface CreateUserRequest {
    google_id?: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    profile_picture?: string;
}