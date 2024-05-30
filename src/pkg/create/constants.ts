import {ServiceStatus} from '../common/types.js'

export const  onActionServiceStatus: {[key: string]: ServiceStatus} = {
  close: 'inactive',
  ready: 'active',
}
