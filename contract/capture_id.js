const { execSync } = require('child_process');
const fs = require('fs');
try {
    const output = execSync('stellar contract deploy --wasm target\\wasm32v1-none\\release\\crowdfunding.wasm --source myid --network testnet', { encoding: 'utf8' });
    fs.writeFileSync('contract_id.txt', output);
    console.log('Success');
} catch (e) {
    fs.writeFileSync('contract_id.txt', (e.stdout || '') + (e.stderr || ''));
    console.log('Error');
}
