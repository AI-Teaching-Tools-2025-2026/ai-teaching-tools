import axios from "axios";

export const authService = {
    fetchUser: async () => {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user`, {
        withCredentials: true,
        });

        return response.data;
    },

    updateUser: async (data: {username: string; email: string; current_password?: string; new_password?: string;}) => {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/update`,
        {
            username: data.username,
            email: data.email,
            current_password: data.current_password || undefined,
            new_password: data.new_password || undefined,
        },
        { withCredentials: true }
        );

        return response.data;
    },

    deleteUser: async () => {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/delete`,
            { withCredentials: true }
        );

        return response.data;
    },

    logout: async () => {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
        );

        return response.data;
    },

};