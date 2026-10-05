/**
 * User Roles Enum
 */
const ROLES = Object.freeze({
  OWNER: 'owner',
  STAFF: 'staff',
});

module.exports = {
  ROLES,
  ALL_ROLES: Object.values(ROLES),
};
