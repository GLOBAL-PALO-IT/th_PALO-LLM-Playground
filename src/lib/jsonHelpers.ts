export const isJsonParsable = (str: string): boolean => {
    try {
        return JSON.parse(str);
    } catch {
        return false;
    }
}