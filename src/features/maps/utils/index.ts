export const generateRandomColor = (): string => {
    // Generate pastel colors that are visually pleasing
    const r = Math.floor(Math.random() * 185 + 70); // Red 100-255
    const g = Math.floor(Math.random() * 185 + 70); // Green 100-255
    const b = Math.floor(Math.random() * 185 + 70); // Blue 100-255
    return `rgb(${r}, ${g}, ${b})`;
};
