export function formatNumberWithCommas(numberString) {
    // Split the string into integer and decimal parts
    const parts = numberString.split(".");
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? "." + parts[1] : "";

    // Add commas to the integer part
    const formattedIntegerPart = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
    );

    // Combine the formatted integer part and the decimal part
    return formattedIntegerPart + decimalPart;
}
