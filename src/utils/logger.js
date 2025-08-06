export function logAction(user, action) {
  console.log(`[${new Date().toISOString()}] ${user} - ${action}`);
}
