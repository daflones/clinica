/**
 * Utilitu00e1rios de autenticau00e7u00e3o para o CRM
 */

/**
 * Verifica se o usuu00e1rio estu00e1 autenticado
 * @returns {boolean} Status de autenticau00e7u00e3o
 */
export const isAuthenticated = () => {
  const session = localStorage.getItem('supabase.auth.token');
  return !!session;
};

/**
 * Limpa os dados de autenticau00e7u00e3o do localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('supabase.auth.token');
};

/**
 * Decodifica o token JWT para extrair informau00e7u00f5es do usuu00e1rio
 * @param {string} token - Token JWT
 * @returns {Object} Informau00e7u00f5es do usuu00e1rio
 */
export const decodeToken = token => {
  if (!token) return null;

  try {
    // JWT tokens su00e3o divididos em 3 partes: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Verifica se o token estu00e1 expirado
 * @param {string} token - Token JWT
 * @returns {boolean} true se expirado, false se vu00e1lido
 */
export const isTokenExpired = token => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Date.now() / 1000; // Tempo atual em segundos
  return decoded.exp < currentTime;
};

/**
 * Obtu00e9m o perfil do usuu00e1rio autenticado
 * @param {Object} supabase - Cliente Supabase
 * @returns {Promise<Object>} Dados do perfil do usuu00e1rio
 */
export const getUserProfile = async supabase => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Usuu00e1rio nu00e3o autenticado');

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error) throw error;

    return { ...user, profile: data };
  } catch (error) {
    console.error('Erro ao obter perfil do usuu00e1rio:', error.message);
    return null;
  }
};
