import React from 'react'
import ManagePeriodRoster from './Manage-Period/ManagePeriodRoster'
import ManagePeriodTeam from './Manage-Period/ManagePeriodTeam'
import ManagePeriodOffs from './Manage-Period/ManagePeriodOffs'
import ManagePeriodDependents from './Manage-Period/ManagePeriodDependents'

function ManagePeriod({ rosterId, setError, setLoading }) {
    
  return (
    <ManagePeriodRoster rosterId={rosterId} setError={setError} setLoading={setLoading}/>
  )
}

export default ManagePeriod