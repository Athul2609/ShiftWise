export const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const getLastDayOfMonth = (month, year) => {
return new Date(year, month, 0).getDate();
};