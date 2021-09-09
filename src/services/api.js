import axios from 'axios'

const api = axios.create({
    baseURL: "https://correios.contrateumdev.com.br/api",
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
})

export default api