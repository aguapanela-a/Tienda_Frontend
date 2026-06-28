const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function refreshToken() {

    const resRefreshToken = await fetch(`${baseUrl}/auth/refrescarToken`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refreshToken: localStorage.getItem("refreshToken"),
        }),
    });
    const dataRefreshToken = await resRefreshToken.json();
    if (!resRefreshToken.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("nombre");
        localStorage.removeItem("id");
        window.location.href = "/";  //navegador nativo de JavaScript
        return;
    }
    console.log(dataRefreshToken.accessToken);
    localStorage.setItem("token", dataRefreshToken.accessToken);
    return dataRefreshToken.accessToken;
}