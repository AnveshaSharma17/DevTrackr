/**
 * Simple date utilities to avoid heavy dependencies like date-fns
 */

const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const format = (date, pattern) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return pattern
    .replace('YYYY', year)
    .replace('MMM', monthNames[d.getMonth()])
    .replace('MM', month)
    .replace('DD', day);
};

const differenceInDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
};

const differenceInHours = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d1 - d2) / (1000 * 60 * 60));
};

const isAfter = (date, compareDate) => {
  return new Date(date) > new Date(compareDate);
};

const parseISO = (str) => new Date(str);

module.exports = {
  subDays,
  format,
  differenceInDays,
  differenceInHours,
  isAfter,
  parseISO,
};
