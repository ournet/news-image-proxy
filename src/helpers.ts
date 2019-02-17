
export function truncateText(text: string, length: number) {
    if (text.length > length) {
        text = text.substr(0, length - 1) + '…';
    }
    return text;
}
