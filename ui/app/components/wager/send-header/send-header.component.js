import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PageContainerHeader from '../../page-container/page-container-header'
import { DEFAULT_ROUTE } from '../../../routes'

export default class SendHeader extends Component {
  static propTypes = {
    clearSend: PropTypes.func,
    history: PropTypes.object,
    titleKey: PropTypes.string,
    subtitleParams: PropTypes.array,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  onClose () {
    this.props.clearSend()
    this.props.history.push(DEFAULT_ROUTE)
  }

  render () {
    console.log('props in send header', this.props)
    const subtitleParams = ["collectWinnings"]
    const titleKey = "getWager"
    return (
      <PageContainerHeader
        onClose={() => this.onClose()}
        subtitle={this.context.t(...subtitleParams)}
        title={this.context.t(titleKey)}
      />
    )
  }
}
