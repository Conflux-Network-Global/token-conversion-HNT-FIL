# token-conversion-HNT-FIL

Updates:
- Powergate localnet seems to work
- Setup wallet using powergate
- Send FIL using powergate
- Setup CLI Wallet for Helium

Todo:
- Get some HNT
- Create smart contract + server for revert and converting (+ some sort of verification?)

Demo implementation plan:
- User on Helium sends HNT to specific address
- User then submits transaction hash to smart contract to either revert or convert
- Smart contract checks it’s an unclaimed transaction then emits event
- Server picks up the event, and checks the transaction hash. If valid transaction, will either send HNT back or send FIL to specified address

Improvements for production:
- HTLC on Helium
- Convert server to use an Oracle network
- Wrap HNT and FIL on Conflux for even more capability
- Implement the file storage application side, not just token conversion

Filecoin Docs
- https://docs.filecoin.io/build/start-building/interacting-with-the-network

PowerGate
- https://docs.textile.io/powergate/
- https://docs.textile.io/powergate/localnet/
- https://docs.textile.io/powergate/cli/pow/
- https://textileio.github.io/js-powergate-client/

Helium Network Endpoint
- https://developer.helium.com/blockchain/api
- https://explorer.helium.com
- https://developer.helium.com/blockchain/blockchain-cli
