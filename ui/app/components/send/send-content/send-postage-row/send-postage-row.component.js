import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SendRowWrapper from '../send-row-wrapper'
import CurrencyDisplay from '../../currency-display'
import Toggle from '../../../toggle/toggle.component'

export default class SendPostageRow extends Component {
  static propTypes = {
    inError: PropTypes.bool,
    usePostage: PropTypes.bool,
    data: PropTypes.object,
    updateUsePostage: PropTypes.func,
    updateSendHexData: PropTypes.func,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  togglePostage = () => {
    const { 
      updateUsePostage, 
      usePostage, 
      updateSendHexData,
      data 
    } = this.props
    if(!data)
      updateSendHexData( {usePostage: true} )
    else {
      updateSendHexData({
        usePostage: data ? !data.usePostage : true
      })
    }
  }

  render () {
    const {
      inError
    } = this.props

    return (
      <SendRowWrapper
        label={`Use Post Office?`}
        showError={inError}
        errorType={'amount'}
      >
        <Toggle toggleState={this.togglePostage} />
      </SendRowWrapper>
    )
  }
}
