import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import TransactionListItem from '../transaction-list-item'
import Button from '../button/button.component'
import { txidFromHex } from '../../../../app/scripts/controllers/transactions/bitbox-utils'

export default class TransactionList extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  }

  static defaultProps = {
    pendingTransactions: [],
    completedTransactions: [],
    transactionToRetry: {},
  }

  static propTypes = {
    pendingTransactions: PropTypes.array,
    completedTransactions: PropTypes.array,
    transactionToRetry: PropTypes.object,
    selectedToken: PropTypes.object,
    updateNetworkNonce: PropTypes.func,
    assetImages: PropTypes.object,
    selectedAddress: PropTypes.string,
  }

  componentDidMount () {
    this.props.updateNetworkNonce()
  }

  componentDidUpdate (prevProps) {
    const { pendingTransactions: prevPendingTransactions = [] } = prevProps
    const { pendingTransactions = [], updateNetworkNonce } = this.props

    if (pendingTransactions.length > prevPendingTransactions.length) {
      updateNetworkNonce()
    }
  }

  shouldShowRetry = transaction => {
    return false

    // TODO: show retry
    // const { transactionToRetry } = this.props
    // const { id, submittedTime } = transaction
    // return id === transactionToRetry.id && Date.now() - submittedTime > 30000
  }

  findContracts (completedTransactions) {
    // Get relevant data to spend contract and put it into transaction
    let formattedTransactions = completedTransactions.map(function (transaction, index, txArray){
      transaction.txParams.value = String(transaction.txParams.value)
      let contractAddrs = transaction.txParams.toAddresses
      if (contractAddrs) {
        if (contractAddrs[0].includes('bitcoincash:p')) {
          let previousTx = txArray[index + 1]
          if(previousTx.txParams.paymentData 
            && previousTx.txParams.paymentData.merchantData 
            && previousTx.txParams.paymentData.merchantData.contract) {
              transaction.txParams.partyHash = previousTx.txParams.partyHash
              transaction.txParams.contract = previousTx.txParams.paymentData.merchantData.contract
              transaction.txParams.value = previousTx.txParams.value
              // Remove exact change Tx
              txArray.splice((index + 1), 1)
            }
        }
      }
      return transaction
    })
    return formattedTransactions.filter(function(transaction){
      if(transaction.txParams.to && transaction.txParams.from)
        return !(transaction.txParams.to == transaction.txParams.from)
      return true
    })
  }

  renderTransactions () {
    const { t } = this.context
    const {
      pendingTransactions = [],
      completedTransactions = [],
      selectedAddress,
    } = this.props

    let formattedTransactions
    // Format with contract info
    try {
      formattedTransactions = this.findContracts(completedTransactions)
    } catch (e) {
      formattedTransactions = completedTransactions
    }

    console.log('formattedTransactions', formattedTransactions)

    return (
      <div className="transaction-list__transactions">
        {pendingTransactions.length > 0 && (
          <div className="transaction-list__pending-transactions">
            <div className="transaction-list__header">
              {`${t('queue')} (${pendingTransactions.length})`}
            </div>
            {pendingTransactions.map((transaction, index) =>
              this.renderTransaction(transaction, index)
            )}
          </div>
        )}
        <div className="transaction-list__completed-transactions">
          <div className="transaction-list__header">{t('history')}</div>
          {formattedTransactions.length > 0
            ? formattedTransactions.map((transaction, index) =>
                this.renderTransaction(transaction, index)
              )
            : this.renderEmpty()}
        </div>
        <div>
          <Button
            type="default"
            style={{ margin: '15px auto', width: '70%' }}
            onClick={() => {
              const url = `https://explorer.bitcoin.com/bch/address/${selectedAddress}`
              global.platform.openWindow({ url })
            }}
          >
            View history on explorer
          </Button>
        </div>
      </div>
    )
  }

  renderTransaction (transaction, index) {
    const { selectedToken, assetImages, selectedAddress } = this.props

    return (
      <TransactionListItem
        transaction={transaction}
        key={`${selectedAddress}${transaction.id}`}
        showRetry={this.shouldShowRetry(transaction)}
        token={selectedToken}
        assetImages={assetImages}
        selectedAddress={selectedAddress}
        index={index}
      />
    )
  }

  renderEmpty () {
    return (
      <div className="transaction-list__empty">
        <div className="transaction-list__empty-text">
          {this.context.t('noTransactions')}
        </div>
      </div>
    )
  }

  render () {
    return <div className="transaction-list">{this.renderTransactions()}</div>
  }
}
