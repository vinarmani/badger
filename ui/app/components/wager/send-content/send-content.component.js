import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PageContainerContent from '../../page-container/page-container-content.component'
import SendAmountRow from './send-amount-row'
import SendFromRow from './send-from-row'
// import SendGasRow from './send-gas-row/'
// import SendHexDataRow from './send-hex-data-row'
import SendToRow from './send-to-row'

export default class SendContent extends Component {
  static propTypes = {
    updateGas: PropTypes.func,
    updateSignature: PropTypes.func,
    updateSendTo: PropTypes.func,
    updateSendFrom: PropTypes.func,
    updateSendData: PropTypes.func,
    updateSendAmount: PropTypes.string,
    scanQrCode: PropTypes.func,
    showHexData: PropTypes.bool,
    selectedToken: PropTypes.object,
    toAddr: PropTypes.string,
    txParams: PropTypes.object,

  }

  componentDidUpdate () {
    const { 
      toAddr,
      txParams,
      updateSendData,
      updateSendAmount,
      updateSendTo
    } = this.props

    if(toAddr) {
      updateSendTo(toAddr)
      updateSendData(txParams)
    }

  }

  render () {
    const { selectedToken, updateSignature } = this.props
    return (
      <PageContainerContent>
        <div className="send-v2__form">
          <SendToRow
          updateSignature={updateSignature}
          />
        </div>
      </PageContainerContent>
    )
  }
}
