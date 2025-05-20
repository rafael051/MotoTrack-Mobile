import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Salva um dado no AsyncStorage
 * @param {string} key - Chave do dado
 * @param {any} value - Valor a ser salvo
 */
export const saveData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error('Erro ao salvar no AsyncStorage:', e);
    }
};

/**
 * Carrega um dado do AsyncStorage
 * @param {string} key - Chave do dado
 * @returns {Promise<any>} - Retorna o dado ou null
 */
export const loadData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Erro ao carregar do AsyncStorage:', e);
        return null;
    }
};

/**
 * Remove um dado do AsyncStorage
 * @param {string} key - Chave do dado
 */
export const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error('Erro ao remover do AsyncStorage:', e);
    }
};
