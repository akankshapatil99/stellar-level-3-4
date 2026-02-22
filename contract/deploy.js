const { execSync } = require('child_process');
try {
    const output = execSync('stellar contract deploy --wasm target\\wasm32v1-none\\release\\crowdfunding.wasm --source akanksha --network testnet', { stdio: 'pipe' }).toString();
    console.log(output);
} catch (e) {
    console.log(e.stdout.toString());
    console.error(e.stderr.toString());
}
