export const generateRandomColor = (): string => {
    // Generate pastel colors that are visually pleasing
    const r = Math.floor(Math.random() * 55 + 200); // Red 200-255
    const g = Math.floor(Math.random() * 55 + 200); // Green 200-255
    const b = Math.floor(Math.random() * 55 + 200); // Blue 200-255
    return `rgb(${r}, ${g}, ${b})`;
};
