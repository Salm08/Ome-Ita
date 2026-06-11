const { randomBytes } = require("crypto");

console.log("\n🔐 Segreti per .env di produzione (copia e incolla):\n");
console.log(`JWT_SECRET="${randomBytes(48).toString("base64url")}"`);
console.log(`ADMIN_PASSWORD="${randomBytes(16).toString("base64url")}"`);
console.log(`TURN_SECRET="${randomBytes(24).toString("base64url")}"`);
console.log(`POSTGRES_PASSWORD="${randomBytes(16).toString("hex")}"`);
console.log("\n⚠️  Salvali in un posto sicuro. Non committarli su Git.\n");
