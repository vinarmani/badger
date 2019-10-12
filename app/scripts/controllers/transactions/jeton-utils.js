const BITBOX = require('bitbox-sdk').BITBOX
const bitbox = new BITBOX()
const Jeton = require('jeton-lib')
const PrivateKey = Jeton.PrivateKey
const PublicKey = Jeton.PublicKey
const Address = Jeton.Address
const Signature = Jeton.Signature
const OutputScript = Jeton.escrow.OutputScript

class JetonUtils {

    static verifySignature(message, pubKey, signature) {
       try {
        let refPubKey = new PublicKey(pubKey)
        let refSig = Signature.fromString(signature)
        return Signature.verify(message, refPubKey, refSig)
       } catch (e) {
           return false
       }
    }

    static outputScriptFromContract (contractObj) {
        let refereePubKey = new PublicKey(contractObj.refereePubKey)
        let parties = contractObj.parties.map(function (party) {
            let pubKey = new Address(party.address)
            return {
                message: party.message, 
                pubKey: pubKey
            }
        })
        const outScript = new OutputScript({
            refereePubKey: refereePubKey,
            parties: parties
        })
        return outScript
    }

    static buildTransaction (txParams, utxos, winnerPrivWIF) {
        const priv = new PrivateKey(winnerPrivWIF)
        const winnerAddr = priv.toAddress()
        const from = txParams.from
        const to = txParams.to

        if(winnerAddr.toString() != to)
            throw new Error('winnerAddr does not match to')

        const contract = txParams.data.contract
        const party = contract.parties.filter(player => player.address == to)
        const message = party[0].message

        let outScript = this.outputScriptFromContract(contract)
        let contractAddress = outScript.toAddress().toString()
        if(contractAddress != from)
          throw new Error('Contract address does not match from address')

        utxos = utxos.map(function bitcoreUtxo(utxo){
            return new Jeton.Transaction.UnspentOutput({
                "address":contractAddress,
                "txid":utxo.txid,
                "vout":utxo.vout,
                "scriptPubKey":utxo.scriptPubKey,
                "satoshis":utxo.satoshis
            })
        })

      let inputTotal = utxos.reduce(function sum(accumulator, currentValue) {
          return accumulator + currentValue.satoshis
      }, 0)
  
      // Each signature adds 372 bytes to the tx
      let byteCount = bitbox.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: 1 }) + (372 * utxos.length)
  
      let transaction = new Jeton.Transaction()
      for (let i = 0; i < utxos.length; i++) {
          transaction.from(utxos[i])          // Feed information about what unspent outputs one can use
      }
      let sighash = (Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID)
      transaction.to(party[0].address, (inputTotal - byteCount))

      const refereeSig = Signature.fromString(txParams.data.refereeSig)
      for (let i = 0; i < utxos.length; i++) {
          transaction.signEscrow(i, priv , message, refereeSig, outScript.toScript(), sighash)
      }

      const hex = transaction.toString()
      return hex
    }
}

module.exports = JetonUtils
