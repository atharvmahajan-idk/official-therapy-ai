import { userMap, activeUsers } from "./maps.utils.js";

async function checkUser(email) {
  if (!userMap.has(email)) {
    const userData = {
      email: email,
      sessionID: randomUUID(),
      totalMess: 0,
      last4Mess: 0,
      messPushTovecDB: 0,
      graph: [],
    };
    userMap.set(email, userData);
    console.log("User added to userMap:", userData);
  }
  if (!activeUsers.has(email)) {
    const userData = {
      lastactive: Date.now(),
    };
    activeUsers.set(email, userData);
    console.log("User added to activeUsers:", userData);
  }
}
export { checkUser };