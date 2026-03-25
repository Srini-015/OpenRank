export const getApiErrorMessage = (error, fallbackMessage) => {
  const message = error?.response?.data?.message;

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return fallbackMessage;
};
