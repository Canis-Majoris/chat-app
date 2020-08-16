const geneateMessage = (username, text) => ({
  text,
  username,
  createdAt: new Date().getTime(),
});
const geneateLocationMessage = (username, { latitude, longitude }) => ({
  url: `https://www.google.com/maps?q=${latitude},${longitude}`,
  username,
  createdAt: new Date().getTime(),
});

module.exports = {
  geneateMessage,
  geneateLocationMessage,
};
