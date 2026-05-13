// ============ ИМПОРТЫ ============
import type { UserData } from "@/types";

// ============ КОНСТАНТЫ ============
const API_BASE_URL = 'http://localhost:3000/api';

// ============ ФУНКЦИИ ДЛЯ АВТОРИЗАЦИИ ============

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

//регистрация
export async function registerUserApi(data: UserData) {
        let url = `${API_BASE_URL}/auth/register`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
}

//вход
export async function loginUserApi (data: {email: string, password: string}) {
    let url = `${API_BASE_URL}/auth/login`;

    const response = await fetch( url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

//получение данных пользователя
export async function getCurrentUserApi (token: string) {
    let url = `${API_BASE_URL}/auth/me`;
    

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    return handleResponse(response);
}

//обновление данных пользователя
export async function updateCurrentUserApi(
    token: string, 
    updates: {
        firstName?: string;
        lastName?: string;
        middleName?: string;
        phone?: string;
    }
) {
    const url = `${API_BASE_URL}/auth/me`;

    const response = await fetch(url, {
        method: 'PUT',                          
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(updates),          
    });

    return handleResponse(response);
}