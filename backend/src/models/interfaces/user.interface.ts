export interface User {
    id: number;
    email: string;
    username: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserData {
    id?: number;
    email: string;
    username: string;
    password_hash: string;
   
}

export interface UserResponse {
    id: number;
    email: string;
    username: string;
   
}

