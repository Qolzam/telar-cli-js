import {ServiceStatus} from '../common/types'

export const  onActionServiceStatus: {[key: string]: ServiceStatus} = {
  ready: 'active',
  close: 'inactive',
}
