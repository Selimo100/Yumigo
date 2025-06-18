// filepath: yumigo/yumigo/utils/helpers.js
export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncateString(string, length) {
    return string.length > length ? string.substring(0, length) + '...' : string;
}