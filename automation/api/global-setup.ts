// Reset mock server state before each suite run.
async function globalSetup() {
  await fetch('http://localhost:3456/api/reset', { method: 'POST' });
}
export default globalSetup;
