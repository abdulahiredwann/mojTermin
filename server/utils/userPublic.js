function sanitizePublicUser(rec) {
  return {
    id: rec.id,
    name: rec.name,
    email: rec.email,
    phone: rec.phone ?? null,
  };
}

module.exports = { sanitizePublicUser };
