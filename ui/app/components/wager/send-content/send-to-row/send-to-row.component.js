import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SendRowWrapper from '../send-row-wrapper'
import EnsInput from '../../../ens-input'
import ReadOnlyInput from '../../../readonly-input'
import { getToErrorObject } from './send-to-row.utils.js'

export default class SendToRow extends Component {
  static propTypes = {
    closeToDropdown: PropTypes.func,
    inError: PropTypes.bool,
    network: PropTypes.string,
    openToDropdown: PropTypes.func,
    to: PropTypes.string,
    toAccounts: PropTypes.array,
    toDropdownOpen: PropTypes.bool,
    updateSendTo: PropTypes.func,
    updateSignature: PropTypes.func,
    updateSendToError: PropTypes.func,
    scanQrCode: PropTypes.func,
    tokenContract: PropTypes.object,
    selectedToken: PropTypes.object,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  // immediate validation
  componentDidMount () {
    this.handleToChange('', '', '')
  }

  handleToChange (to, nickname = '', toError) {
    const {
      updateSendTo,
      updateSendToError,
      selectedToken,
      tokenContract,
    } = this.props
    const toErrorObject = getToErrorObject(to, toError)

    updateSendTo(to, nickname)
    updateSendToError(toErrorObject)
    if (toErrorObject.to === null) {
      // updateGas({ to })
    }
  }

  handleSignatureChange (e) {
    const {updateSignature} = this.props
    updateSignature(e.target.value)
  }

  render () {
    const {
      closeToDropdown,
      inError,
      network,
      openToDropdown,
      to,
      toAccounts,
      toDropdownOpen,
    } = this.props

    return (
      <SendRowWrapper
        errorType={'to'}
        label={'Referee Signature'}
        showError={inError}
      >
      <input onChange={e => this.handleSignatureChange(e)} />
      </SendRowWrapper>
    )
  }
}
