const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const formatTenure = (startDate?: string) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const totalDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / DAY_IN_MS));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays - years * 365 - months * 30;
  return {
    years,
    months,
    days,
    label: `${years} años · ${months} meses · ${days} días`,
  };
};

export const getBirthdayCountdown = (birthDate?: string) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday.getTime() <= now.getTime()) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const diff = nextBirthday.getTime() - now.getTime();
  const days = Math.floor(diff / DAY_IN_MS);
  const hours = Math.floor((diff % DAY_IN_MS) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return {
    days,
    hours,
    minutes,
    formattedDate: birth.toLocaleDateString(),
    ageTurning: nextBirthday.getFullYear() - birth.getFullYear(),
  };
};
