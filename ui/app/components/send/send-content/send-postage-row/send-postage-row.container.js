import { connect } from 'react-redux'
import { 
  getSendUsePostage,
  getSendHexData
 } from '../../send.selectors'
import { sendAmountIsInError } from './send-postage-row.selectors'
import { 
  updateUsePostage,
  updateSendHexData
 } from '../../../../actions'
import { updateSendErrors } from '../../../../ducks/send.duck'
import SendPostageRow from './send-postage-row.component'

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendPostageRow)

function mapStateToProps (state) {
  return {
    inError: sendAmountIsInError(state),
    data: getSendHexData(state),
    usePostage: getSendUsePostage(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    updateUsePostage: bool => dispatch(updateUsePostage(bool)),
    updateSendHexData: hexDataObject => {
      dispatch(updateSendHexData(hexDataObject))
    }
  }
}
