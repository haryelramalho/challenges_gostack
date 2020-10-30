const formatDate = (date: Date): string => {
  return Intl.DateTimeFormat('pt-BR').format(date);
};

export default formatDate;
