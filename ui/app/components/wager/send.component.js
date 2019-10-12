import React from 'react'
import PropTypes from 'prop-types'
import PersistentForm from '../../../lib/persistent-form'
import {
  getAmountErrorObject,
  getGasFeeErrorObject,
  getToAddressForGasUpdate,
  doesAmountErrorRequireUpdate,
} from './send.utils'

import SendHeader from './send-header'
import SendContent from './send-content'
import SendFooter from './send-footer'
const jetonUtils = require('../../../../app/scripts/controllers/transactions/jeton-utils')

export default class SendTransactionScreen extends PersistentForm {

  static propTypes = {
    amount: PropTypes.string,
    amountConversionRate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    blockGasLimit: PropTypes.string,
    conversionRate: PropTypes.number,
    editingTransactionId: PropTypes.string,
    from: PropTypes.object,
    to: PropTypes.string,
    gasLimit: PropTypes.string,
    gasPrice: PropTypes.string,
    gasTotal: PropTypes.string,
    history: PropTypes.object,
    network: PropTypes.string,
    primaryCurrency: PropTypes.string,
    recentBlocks: PropTypes.array,
    selectedAddress: PropTypes.string,
    selectedToken: PropTypes.object,
    tokenBalance: PropTypes.string,
    tokenContract: PropTypes.object,
    updateAndSetGasTotal: PropTypes.func,
    updateSendErrors: PropTypes.func,
    updateSendTo: PropTypes.func,
    updateSendFrom: PropTypes.func,
    updateSendData: PropTypes.func,
    updateSendAmount: PropTypes.string,
    updateSendTokenBalance: PropTypes.func,
    scanQrCode: PropTypes.func,
    qrCodeDetected: PropTypes.func,
    qrCodeData: PropTypes.object,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.qrCodeData) {
      if (nextProps.qrCodeData.type === 'address') {
        const scannedAddress = nextProps.qrCodeData.values.address.toLowerCase()
        const currentAddress = this.props.to && this.props.to.toLowerCase()
        if (currentAddress !== scannedAddress) {
          this.props.updateSendTo(scannedAddress)
          this.updateGas({ to: scannedAddress })
          // Clean up QR code data after handling
          this.props.qrCodeDetected(null)
        }
      }
    }
  }

  updateGas ({ to: updatedToAddress, amount: value } = {}) {
    const {
      amount,
      blockGasLimit,
      editingTransactionId,
      gasLimit,
      gasPrice,
      recentBlocks,
      selectedAddress,
      selectedToken = {},
      to: currentToAddress,
      updateAndSetGasTotal,
    } = this.props

    updateAndSetGasTotal({
      blockGasLimit,
      editingTransactionId,
      gasLimit,
      gasPrice,
      recentBlocks,
      selectedAddress,
      selectedToken,
      to: getToAddressForGasUpdate(updatedToAddress, currentToAddress),
      value: value || amount,
    })
  }

  updateRefereeSignature (signature) {
    const {txParams} = this.props.location.state
    txParams.refereeSig = signature
    const sigResult = this.checkRefereeSignature(txParams)
    this.props.location.state.txParams.refereeSig = sigResult.refereeSig
    this.props.location.state.txParams.to = sigResult.toAddr
  }

  checkRefereeSignature (txParams) {
    const {contract: {parties, refereePubKey}, from, refereeSig} = txParams
    const party = parties.filter(player => player.address == from)
    const valid = jetonUtils.verifySignature(party[0].message, refereePubKey, refereeSig)
    console.log('is referee signature valid? ', valid)
    if(valid) {
      return {
        refereeSig: refereeSig,
        toAddr: party[0].address
      }
    }
    return undefined
  }

  componentDidUpdate (prevProps) {
    const {
      amount,
      amountConversionRate,
      conversionRate,
      from: { address, balance },
      gasTotal,
      network,
      primaryCurrency,
      selectedToken,
      tokenBalance,
      updateSendErrors,
      updateSendTo,
      updateSendTokenBalance,
      to,
      tokenContract,
    } = this.props

    const {
      from: { balance: prevBalance },
      gasTotal: prevGasTotal,
      tokenBalance: prevTokenBalance,
      network: prevNetwork,
    } = prevProps

    const uninitialized = [prevBalance].every(n => n === null)
      
    /*
    const amountErrorRequiresUpdate = doesAmountErrorRequireUpdate({
      balance,
      gasTotal,
      prevBalance,
      prevGasTotal,
      prevTokenBalance,
      selectedToken,
      tokenBalance,
    })

    if (amountErrorRequiresUpdate) {
      const amountErrorObject = getAmountErrorObject({
        amount,
        amountConversionRate,
        balance,
        conversionRate,
        gasTotal,
        primaryCurrency,
        selectedToken,
        tokenBalance,
      })

      const gasFeeErrorObject = { gasFee: null }
      // const gasFeeErrorObject = selectedToken
      // ? getGasFeeErrorObject({
      //   amount,
      //   amountConversionRate,
      //   balance,
      //   conversionRate,
      //   gasTotal,
      //   primaryCurrency,
      //   selectedToken,
      //   tokenBalance,
      // })
      // : { gasFee: null }
      updateSendErrors(Object.assign(amountErrorObject, gasFeeErrorObject))
    }

    if (!uninitialized) {
      if (network !== prevNetwork && network !== 'loading') {
        updateSendTokenBalance({
          selectedToken,
          tokenContract,
          address,
        })
        this.updateGas()
      }
    } */
  }

  componentWillMount () {
    console.log('in wager version')
    const {
      from: { address },
      selectedToken,
      tokenContract,
      updateSendTokenBalance,
    } = this.props
    updateSendTokenBalance({
      selectedToken,
      tokenContract,
      address,
    })
    this.updateGas()

    // Show QR Scanner modal  if ?scan=true
    if (window.location.search === '?scan=true') {
      this.props.scanQrCode()

      // Clear the queryString param after showing the modal
      const cleanUrl = location.href.split('?')[0]
      history.pushState({}, null, `${cleanUrl}`)
      window.location.hash = '#send'
    }
  }

  componentWillUnmount () {
    this.props.resetSendState()
  }

  render () {
    const { 
      history, 
      showHexData, 
      selectedToken,
      updateSendData,
      updateSendFrom,
      updateSendTo,
      updateSendAmount,
      to
    } = this.props

    let txParams = {}
    if (this.props.location.state) {
      txParams = this.props.location.state.txParams
    }

    return (
      <div className="page-container">
        <SendHeader history={history} />
        <SendContent
          updateGas={updateData => this.updateGas(updateData)}
          scanQrCode={_ => this.props.scanQrCode()}
          showHexData={showHexData}
          selectedToken={selectedToken}
          updateSignature={sig => this.updateRefereeSignature(sig)}
          updateSendTo={updateSendTo}
          updateSendFrom={updateSendFrom}
          updateSendData={updateSendData}
          updateSendAmount={updateSendAmount}
          toAddr={to ? null : txParams.to}
          txParams={txParams}
        />
        <SendFooter 
          history={history}
          txParams={txParams}
        />
      </div>
    )
  }
}
